# Smart Market DVD ⚡

Marketplace de DVDs avec thème rétro-futuriste inspiré de *Back to the Future*. Interface neon-dark, catalogue organisé par saga, panier interactif avec calcul de prix en temps réel via API.

---

## Fonctionnalités

- **Catalogue par saga** — produits regroupés automatiquement (BTTF, Star Wars, Terminator, Alien…) avec couleurs neon distinctes par franchise
- **Recherche en temps réel** — filtrage par titre, saga, catégorie ou numéro de partie
- **Panier interactif** — ajout, suppression, modification de quantité avec debounce 600 ms avant appel API
- **Calcul de prix API** — remises saga calculées côté serveur (ex : -20 % pour 3 films BTTF) avec fallback local en DEV si l'API est hors-ligne
- **Time Circuit** — affichage LED style *DeLorean* du sous-total / remise / total
- **Résumé de facturation** — détail ligne par ligne avec taux de remise, montant économisé, labels de saga dynamiques
- **Mode mock** — données locales configurables via `VITE_USE_MOCK=true` (aucun backend requis)

---

## Stack technique

| Couche | Technologie |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 6 + `@vitejs/plugin-react` |
| Style | Tailwind CSS v4 (`@theme` tokens), `cva`, `clsx` + `tailwind-merge` |
| Data fetching | TanStack Query v5 (`useQuery` / `useMutation`) |
| Icônes | Lucide React |
| Tests | Vitest v3 + Testing Library (136 tests) |
| Runtime Docker | nginx:1.27-alpine (~25 MB image finale) |

---

## Architecture

Le projet suit une **architecture Clean DDD** en 4 couches strictement découplées.

```
src/
├── domain/                  # Entités, interfaces de service, utilitaires purs
│   ├── entities/            # Cart, Product, PriceBreakdown (interfaces TypeScript)
│   ├── mappers/             # CartMapper — anti-corruption layer API ↔ domaine
│   ├── services/            # ICartService, IProductService (contrats abstraits)
│   └── utils/               # groupProductsBySaga (fonction pure, testée isolément)
│
├── application/             # Cas d'usage + hooks React + injection de dépendances
│   ├── usecases/            # GetProductsUseCase, CalculateCartPriceUseCase
│   ├── hooks/               # useProducts, useCart, useCalculatePrice
│   └── di.ts                # Wiring des singletons (seul endroit couplé à l'infra)
│
├── infrastructure/          # Implémentations concrètes des services
│   ├── api/                 # ApiClient (fetch typé + ApiError), types DTO
│   ├── mappers/             # ProductMapper, PriceBreakdownMapper
│   ├── mocks/               # mockData.ts (données locales)
│   └── repositories/        # CartRepository (fallback local DEV), ProductRepository
│
└── presentation/            # Composants React + pages
    ├── components/          # CatalogGrid, CartPanel, CartSummary, TimeCircuit, ui/
    └── pages/               # MarketplacePage (page principale orchestratrice)
```

### Flux de données

```
ProductCard (onAdd)
    → useCart.addItem()
        → cartKey change (debounce 600 ms)
            → useCalculatePrice.mutate(items)
                → CalculateCartPriceUseCase.execute()
                    → CartRepository.calculatePrice()
                        → CartMapper.toRequest() → POST /cart/price
                        ← CartMapper.toDomain()  ← réponse API
                    ← PriceBreakdown (domaine)
        ← CartSummary + TimeCircuit mis à jour
```

---

## Variables d'environnement

Toutes les variables sont **préfixées `VITE_`** et **bakées dans le bundle JS** au moment du build (comportement Vite — pas de runtime injection).

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL de base du backend (sans slash final) |
| `VITE_USE_MOCK` | `false` | `true` → données locales, aucun appel réseau |
| `VITE_PRICES_IN_CENTS` | `false` | `true` → backend envoie les prix en centimes |

Créer un fichier `.env.local` à partir du modèle :

```bash
cp .env.example .env.local
# puis éditer .env.local selon l'environnement cible
```

---

## Démarrage sans Docker

### Prérequis

- Node.js ≥ 22
- npm ≥ 10

### Installation

```bash
npm install
```

### Développement (hot-reload)

```bash
npm run dev
# → http://localhost:3000
```

> **Sans backend :** ajouter `VITE_USE_MOCK=true` dans `.env.local` pour utiliser les données mockées.

### Tests

```bash
npm test              # mode watch interactif
npm run coverage      # rapport de couverture HTML dans coverage/
```

### Vérifications statiques

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript (sans émission de fichiers)
```

### Build local par environnement

```bash
npm run build:test      # mode test    → charge .env.test
npm run build:recette   # mode recette → charge .env.recette
npm run build:prod      # mode production → charge .env.production
npm run preview         # prévisualise le dist/ local sur http://localhost:4173
```

---

## Démarrage avec Docker

### Prérequis

- Docker Desktop ≥ 24
- Docker Compose v2 (inclus dans Docker Desktop)

### Architecture de l'image

L'image est construite en **4 stages** via un pattern multi-stage pour rester légère :

| Stage | Base | Poids | Rôle |
|---|---|---|---|
| `deps` | `node:22-alpine` | ~300 MB | `npm ci` — couche cache partagée |
| `dev` | hérite `deps` | ~300 MB | Hot-reload Vite, source en bind-mount |
| `builder` | hérite `deps` | ~300 MB | `tsc + vite build --mode $VITE_MODE` — jamais poussé |
| `runner` | `nginx:1.27-alpine` | **~25 MB** | Sert uniquement le `dist/` statique |

Le `runner` final ne contient ni Node.js, ni code source, ni `node_modules`.

### Développement local (hot-reload)

```bash
npm run docker:local
# ou directement :
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
# → http://localhost:3000
```

Le répertoire source est monté en volume — toute modification est immédiatement reflétée sans reconstruire l'image.

---

## Déploiement par environnement

### Test / CI

Bundle compilé avec `VITE_USE_MOCK=true` — aucun backend requis.

```bash
npm run docker:test
# → http://localhost:8080

# Construire l'image uniquement (pour un pipeline CI) :
npm run docker:build:test
# → image taguée : smart-market-dvd:test
```

---

### Recette (staging)

`VITE_API_URL` est requis et doit pointer vers le backend de staging.

**Option 1 — variable d'environnement shell :**

```bash
export VITE_API_URL=https://api.recette.example.com
npm run docker:recette
# → http://localhost:8081
```

**Option 2 — fichier `.env.recette` à la racine :**

```
VITE_API_URL=https://api.recette.example.com
```

```bash
npm run docker:build:recette   # construit l'image smart-market-dvd:recette
```

---

### Production

`VITE_API_URL` est **obligatoire** — une erreur explicite est levée si absent.
Les sourcemaps sont **désactivés** (bundle plus léger, code source non exposé).

**Option 1 — variable shell :**

```bash
export VITE_API_URL=https://api.example.com
npm run docker:prod
# → http://localhost:80
```

**Option 2 — fichier `.env.production` à la racine :**

```
VITE_API_URL=https://api.example.com
```

**Construire et pousser vers un registry :**

```bash
npm run docker:build:prod
# → image taguée : smart-market-dvd:prod

docker tag smart-market-dvd:prod registry.example.com/smart-market-dvd:1.0.0
docker push registry.example.com/smart-market-dvd:1.0.0
```

---

### Arrêter les conteneurs

```bash
npm run docker:down
```

---

## Référence des scripts npm

| Script | Description |
|---|---|
| `npm run dev` | Serveur Vite hot-reload (port 3000) |
| `npm run build` | Build production (mode `production`) |
| `npm run build:test` | Build mode `test` (mock activé) |
| `npm run build:recette` | Build mode `recette` |
| `npm run build:prod` | Build mode `production` (alias explicite) |
| `npm run preview` | Prévisualise le `dist/` local |
| `npm test` | Tests en watch mode |
| `npm run coverage` | Rapport de couverture |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript sans émission de fichiers |
| `npm run docker:local` | Build + up développement (hot-reload) |
| `npm run docker:test` | Build + up environnement test |
| `npm run docker:recette` | Build + up environnement recette |
| `npm run docker:prod` | Build + up environnement production |
| `npm run docker:build:test` | Construit uniquement l'image test |
| `npm run docker:build:recette` | Construit uniquement l'image recette |
| `npm run docker:build:prod` | Construit uniquement l'image production |
| `npm run docker:down` | Arrête et supprime les conteneurs |
