// src/app/admin/layout.tsx
import Link from 'next/link';
import '@/app/globals.css';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md">
          <nav className="mt-5">
            <Link href="/admin" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Dashboard
            </Link>
            <Link href="/admin/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Products
            </Link>
            <Link href="/admin/sales" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Sales
            </Link>
            <Link href="/admin/orders" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Orders
            </Link>
            <Link href="/admin/redeem-codes" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Redeem Codes
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
