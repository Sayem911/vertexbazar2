// File: src/components/Header.tsx

import Link from 'next/link';
import Search from '@/components/Search';
import MobileMenu from '@/components/MobileMenu';
import CartButton from '@/components/CartButton';


export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      
        <MobileMenu />
        <Search />
        <CartButton />
      </div>
    </header>
  );
}
