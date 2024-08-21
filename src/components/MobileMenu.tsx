// File: src/components/MobileMenu.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, ShoppingBag, ShoppingCart, User, LogIn } from 'lucide-react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

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
          <nav className="mt-6">
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
            <Link href="/profile" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
              <User className="inline-block mr-2" size={20} />
              Profile
            </Link>
            <Link href="/login" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
              <LogIn className="inline-block mr-2" size={20} />
              Login
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}