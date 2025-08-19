import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-4">The page you're looking for doesn't exist.</p>
    <Button asChild>
      <Link to="/boards">Go back to Boards</Link>
    </Button>
  </div>
);

export default NotFoundPage;