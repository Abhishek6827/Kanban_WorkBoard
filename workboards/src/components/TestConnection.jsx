import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

const TestConnection = () => {
  const { data, isLoading, error } = useQuery(
    'test-api',
    async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/`);
      return response.data;
    },
    {
      retry: 1,
    }
  );

  if (isLoading) return <div>Testing API connection...</div>;
  if (error) return <div>API Error: {error.message}</div>;

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h3 className="font-bold text-green-800">API Connection Successful!</h3>
      <pre className="text-sm text-green-700 mt-2">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestConnection;