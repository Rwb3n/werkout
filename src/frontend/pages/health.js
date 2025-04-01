import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function HealthCheck() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Use the NEXT_PUBLIC_API_URL environment variable, or default to localhost:5000
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/health`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(`${data.status} - ${data.message}`);
      } catch (err) {
        console.error('Health check failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Health Check - Werkout.in</title>
      </Head>

      <main className="py-10">
        <h1 className="text-2xl font-bold mb-4">Backend Connection Status</h1>
        
        {loading ? (
          <p className="text-gray-600">Checking backend connection...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Connection Failed</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Make sure your backend server is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
            </p>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Connection Successful</p>
            <p>Status: {status}</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Environment Information</h2>
          <ul className="list-disc pl-5">
            <li>NODE_ENV: {process.env.NODE_ENV || 'Not set'}</li>
            <li>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</li>
          </ul>
        </div>
      </main>
    </div>
  );
} 