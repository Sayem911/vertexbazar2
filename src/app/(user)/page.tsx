// File: src/app/page.tsx

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-xl mb-6">Discover amazing products at great prices!</p>
        <Button asChild>
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wide Selection</CardTitle>
          </CardHeader>
          <CardContent>
            Browse through our extensive catalog of high-quality products.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Great Deals</CardTitle>
          </CardHeader>
          <CardContent>
            Enjoy competitive prices and regular discounts on our products.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earn Points</CardTitle>
          </CardHeader>
          <CardContent>
            Collect points with every purchase and redeem them for discounts.
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        {/* We'll add featured products here later */}
        <p>Check back soon for our featured products!</p>
      </section>
    </div>
  )
}