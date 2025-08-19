import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import MyWorkBoardsPage from './pages/MyWorkBoardsPage';
import CreateBoardPage from './pages/CreateBoardPage';
import BoardDetailPage from './pages/BoardDetailPage';
import WorkBoardPage from './pages/WorkBoardPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const PrivateRoute = ({ children }) => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/boards" element={<PrivateRoute><MyWorkBoardsPage /></PrivateRoute>} />
            <Route path="/create-board" element={<PrivateRoute><CreateBoardPage /></PrivateRoute>} />
            <Route path="/boards/:id" element={<PrivateRoute><BoardDetailPage /></PrivateRoute>} />
            <Route path="/board/:boardId" element={<PrivateRoute><WorkBoardPage /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/boards" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;