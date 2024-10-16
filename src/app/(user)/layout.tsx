import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Link from 'next/link';
import { Providers } from "@/app/provider"; // Wraps with context
import Header from '@/components/Header';
import DynamicSidebar from '@/components/DynamicSidebar'; // Import the sidebar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Our Store",
  description: "Discover amazing products at great prices!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap application in providers for context access */}
        <Providers>
          <div className="flex h-screen bg-gray-100">
            {/* Sidebar for desktop */}
            <div className="hidden md:block">
              <aside className="w-64 bg-white shadow-md h-full">
                <div className="p-4">
                  <Link href="/" className="text-2xl font-bold text-gray-800">
                    Our Store
                  </Link>
                </div>
                <DynamicSidebar /> {/* Ensure this is within Providers */}
              </aside>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
              <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                  © 2024 Our Store. All rights reserved.
                </div>
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
