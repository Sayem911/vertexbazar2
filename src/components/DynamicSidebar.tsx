'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';

export default function DynamicSidebar() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  return (
    <nav className="space-y-4">
      <Link href="/" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
        Home
      </Link>
      <Link href="/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
        Products
      </Link>
      <Link href="/cart" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
        Cart
      </Link>
      {status === 'authenticated' && session?.user ? (
        <>
          <Link href="/profile" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            {session.user.name || 'Profile'}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-200"
          >
            Logout
          </button>
        </>
      ) : status === 'unauthenticated' ? (
        <div>
          <Link href="/signin" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Login
          </Link>
          <Link href="/signup" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="py-2 px-4 text-gray-500">Loading...</div>
      )}
    </nav>
  );
}