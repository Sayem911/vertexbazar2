// HomePage.tsx
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Our Store</h1>
        <p className="text-xl mb-6 text-zinc-300">Discover amazing products at great prices!</p>
        <Button asChild variant="outline" className="hover:bg-zinc-800">
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Wide Selection</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-300">
            Browse through our extensive catalog of high-quality products.
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Great Deals</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-300">
            Enjoy competitive prices and regular discounts on our products.
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Earn Points</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-300">
            Collect points with every purchase and redeem them for discounts.
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Featured Products</h2>
        <p className="text-zinc-300">Check back soon for our featured products!</p>
      </section>
    </div>
  )
}