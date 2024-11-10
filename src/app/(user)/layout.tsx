// RootLayout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Link from 'next/link';
import { Providers } from "@/app/provider";
import Header from '@/components/Header';
import DynamicSidebar from '@/components/DynamicSidebar';

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
      <body className={`${inter.className} bg-[#2C363A] text-white`}>
        <Providers>
          <div className="flex h-screen bg-[#2C363A]">
            {/* Sidebar for desktop */}
            <div className="hidden md:block">
              <aside className="w-64 bg-[#252D31] border-r border-[#3A454A] h-full">
                <div className="p-4">
                  <Link href="/" className="text-2xl font-bold text-white">
                    Our Store
                  </Link>
                </div>
                <DynamicSidebar />
              </aside>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#2C363A]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
              <footer className="bg-[#252D31] border-t border-[#3A454A]">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
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