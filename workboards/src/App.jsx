import {
  HashRouter as Router, // Change this line
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BoardsList from "./pages/BoardsList";
import BoardDetail from "./pages/BoardDetail";
import CreateBoard from "./pages/CreateBoard";
import TestConnection from "./components/TestConnection";
import "./index.css";

// This component must be defined INSIDE the AuthProvider to access the context
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-medium"></div>
            <div className="absolute inset-0 rounded-full bg-blue-600 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
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
              path="/create-board"
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
            <Route path="/test" element={<TestConnection />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#1f2937",
                border: "1px solid rgba(229, 231, 235, 0.8)",
                borderRadius: "12px",
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
