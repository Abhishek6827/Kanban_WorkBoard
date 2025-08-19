import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../contexts/AuthContext';
import { getBoards, deleteBoard } from '../api';
import WorkBoardCard from '../components/WorkBoardCard';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyWorkBoardsPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const fetchedBoards = await getBoards();
      setBoards(fetchedBoards);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Failed to load boards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const handleDeleteAllBoards = async () => {
    try {
      setLoading(true);
      for (const board of boards) {
        await deleteBoard(board.id);
      }
      setBoards([]);
    } catch (err) {
      console.error('Error deleting boards:', err);
      setError('Failed to delete all boards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My WorkBoards</h1>
          <p className="text-gray-600">Assigned to Me</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/create-board" className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-48 hover:border-gray-400 transition-colors">
            <Plus className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-600">Create New Board</span>
          </div>
        </Link>
        {boards.map((board) => (
          <WorkBoardCard
            key={board.id}
            id={board.id}
            title={board.name}
            description={board.description}
            created_at={board.created_at}
            tasks={board.tasks || []}
          />
        ))}
      </div>

      {boards.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="destructive" onClick={handleDeleteAllBoards}>
            Delete All Boards
          </Button>
        </div>
      )}
    </div>
  );
}