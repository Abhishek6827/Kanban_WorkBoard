import {
  BrowserRouter as Router,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
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
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: "#363636", color: "#fff" },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
