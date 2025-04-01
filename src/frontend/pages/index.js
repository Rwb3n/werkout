import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Werkout.in - Connect with Fitness Providers</title>
        <meta name="description" content="Find and connect with personal trainers, coaches, fitness groups, clubs, gyms, and event organizers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">
              Welcome to Werkout.in
            </h1>
            <p className="text-center mb-8">
              A platform to connect fitness seekers with fitness providers
            </p>
            <div className="flex justify-center">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                Find Trainers
              </button>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Join as Trainer
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="py-4 text-center border-t mt-10">
        <p>© 2025 Werkout.in. All rights reserved.</p>
      </footer>
    </div>
  );
} 