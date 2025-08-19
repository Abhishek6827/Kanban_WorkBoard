import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import BoardsList from './pages/BoardsList';
import BoardDetail from './pages/BoardDetail';
import CreateBoard from './pages/CreateBoard';
import TestConnection from './components/TestConnection';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/test" element={<TestConnection />} />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <BoardsList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/boards/create" 
                element={
                  <PrivateRoute>
                    <CreateBoard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/boards/:boardId" 
                element={
                  <PrivateRoute>
                    <BoardDetail />
                  </PrivateRoute>
                } 
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;