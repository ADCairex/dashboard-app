
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Orders from './Pages/Orders';
import Products from './Pages/Products';
import Login from './Pages/Login';
import Metrics from './Pages/Metrics';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const SESSION_KEY = 'dashboard_session';
const SESSION_TIMEOUT_MS = 5 * 60 * 60 * 1000; // 5 horas

function isSessionValid() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  try {
    const { timestamp } = JSON.parse(session);
    if (!timestamp) return false;
    return Date.now() - timestamp < SESSION_TIMEOUT_MS;
  } catch {
    return false;
  }
}

function setSessionActive() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}



function ProtectedRoutes() {
  // Renueva sesión con cada navegación o acción global (clic, tecla)
  const location = useLocation();
  useEffect(() => {
    setSessionActive();
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    const renew = () => setSessionActive();
    window.addEventListener('click', renew);
    window.addEventListener('keydown', renew);
    return () => {
      window.removeEventListener('click', renew);
      window.removeEventListener('keydown', renew);
    };
  }, []);

  return (
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
      <Route
        path="/metrics"
        element={
          <Layout currentPageName="Métricas">
            <Metrics />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}

function App() {
  const [isLogged, setIsLogged] = useState(isSessionValid());

  // Expira sesión si pasa el tiempo
  useEffect(() => {
    if (!isLogged) return;
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        clearSession();
        setIsLogged(false);
      }
    }, 60 * 1000); // chequea cada minuto
    return () => clearInterval(interval);
  }, [isLogged]);

  // Al hacer login
  const handleLogin = useCallback(() => {
    setSessionActive();
    setIsLogged(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isLogged ? (
          <ProtectedRoutes />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
