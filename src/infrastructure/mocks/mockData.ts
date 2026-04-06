import type { Product } from '../../domain/entities/Product';

/** Static catalog used as dev fallback when the API is unavailable. */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'bttf-1',
    title: 'Back to the Future',
    price: 15,
    category: 'bttf',
    bttfPart: 1,
    description: 'Marty McFly is accidentally sent back to 1955 in a time-traveling DeLorean.',
  },
  {
    id: 'bttf-2',
    title: 'Back to the Future Part II',
    price: 15,
    category: 'bttf',
    bttfPart: 2,
    description: 'Marty and Doc travel to 2015, disturbing the space-time continuum.',
  },
  {
    id: 'bttf-3',
    title: 'Back to the Future Part III',
    price: 15,
    category: 'bttf',
    bttfPart: 3,
    description: 'Doc is stranded in 1885. Marty goes back to the Wild West to rescue him.',
  },
  {
    id: 'sw-1',
    title: 'Star Wars: A New Hope',
    price: 20,
    category: 'other',
    sagaName: 'Star Wars',
    description: 'The Rebel Alliance must destroy the Death Star with the help of Luke Skywalker.',
  },
  {
    id: 't2-1',
    title: 'Terminator 2: Judgment Day',
    price: 20,
    category: 'other',
    sagaName: 'Terminator',
    description: 'A reprogrammed Terminator must protect John Connor from a liquid-metal T-1000.',
  },
  {
    id: 'gb-1',
    title: 'Ghostbusters',
    price: 20,
    category: 'other',
    // no sagaName → goes to "Autres produits"
    description: 'Three parapsychology professors set up a ghost-catching business in New York City.',
  },
  {
    id: 'rm-1',
    title: 'RoboCop',
    price: 20,
    category: 'other',
    // no sagaName → goes to "Autres produits"
    description: 'In a crime-ridden Detroit, a murdered cop is resurrected as a powerful cyborg.',
  },
  {
    id: 'bl-1',
    title: 'Blade Runner',
    price: 20,
    category: 'other',
    // no sagaName → goes to "Autres produits"
    description: 'A blade runner must pursue and terminate replicants who have escaped from the off world colonies.',
  },
];
