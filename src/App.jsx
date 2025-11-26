import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Orders from './Pages/Orders';
import Products from './Pages/Products';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route
            path="/orders"
            element={
              <Layout currentPageName="Orders">
                <Orders />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout currentPageName="Products">
                <Products />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
