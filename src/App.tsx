import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MarketplacePage from './presentation/pages/MarketplacePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarketplacePage />
    </QueryClientProvider>
  );
}

export default App;
