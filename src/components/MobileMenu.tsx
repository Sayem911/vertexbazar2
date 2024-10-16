// File: src/components/MobileMenu.tsx

'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, ShoppingBag, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call the custom signout route
      await axios.post('/api/auth/signout');
      
      // Use NextAuth's signOut function
      await signOut({ redirect: false });

      router.push('/signin');
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-700">
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <nav className="mt-6 space-y-4">
            <Link href="/" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
              <Home className="inline-block mr-2" size={20} />
              Home
            </Link>
            <Link href="/products" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
              <ShoppingBag className="inline-block mr-2" size={20} />
              Products
            </Link>
            <Link href="/cart" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
              <ShoppingCart className="inline-block mr-2" size={20} />
              Cart
            </Link>
            {status === 'authenticated' && session?.user ? (
              <>
                <Link href="/profile" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
                  <User className="inline-block mr-2" size={20} />
                  {session.user.name || 'Profile'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
                >
                  <LogOut className="inline-block mr-2" size={20} />
                  Logout
                </button>
              </>
            ) : status === 'unauthenticated' ? (
              <>
                <Link href="/signin" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
                  <LogIn className="inline-block mr-2" size={20} />
                  Login
                </Link>
                <Link href="/signup" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="px-4 py-2 text-gray-500">Loading...</div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
