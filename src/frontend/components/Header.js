import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-primary-500">
            <Link href="/">
              Werkout.in
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-500">
              Home
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-primary-500">
              Find Trainers
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-primary-500">
              Community
            </Link>
            {isSignedIn && (
              <Link href="/workouts" className="text-gray-700 hover:text-primary-500">
                Workout Tracker
              </Link>
            )}
            <Link href="/health" className="text-gray-700 hover:text-primary-500">
              Health Check
            </Link>
            {!isSignedIn ? (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary-500">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">
                  Sign Up
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-500">
                Dashboard
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-500 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/" className="block text-gray-700 hover:text-primary-500">
              Home
            </Link>
            <Link href="/search" className="block text-gray-700 hover:text-primary-500">
              Find Trainers
            </Link>
            <Link href="/community" className="block text-gray-700 hover:text-primary-500">
              Community
            </Link>
            {isSignedIn && (
              <Link href="/workouts" className="block text-gray-700 hover:text-primary-500">
                Workout Tracker
              </Link>
            )}
            <Link href="/health" className="block text-gray-700 hover:text-primary-500">
              Health Check
            </Link>
            {!isSignedIn ? (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-primary-500">
                  Login
                </Link>
                <Link href="/signup" className="block bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 text-center">
                  Sign Up
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="block text-gray-700 hover:text-primary-500">
                Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 