import React from 'react';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; // Import Clerk components
import Link from 'next/link'; // Import Next.js Link
import { Button } from '@/components/ui/Button'; // Import Button for styling links

// Placeholder Header component
const Header = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-xl font-bold text-primary">
          Werkout.in
        </Link>

        {/* Auth Controls */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* Mount the UserButton component */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            {/* Signed out users get sign in/up links */}
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

// Placeholder Footer component
const Footer = () => {
  return (
    <footer className="bg-muted py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Werkout.in. All rights reserved.
        {/* TODO: Add footer links */}
      </div>
    </footer>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

// Main Layout component
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 