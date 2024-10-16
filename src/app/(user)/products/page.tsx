// File: src/app/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface IProduct {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  region: string;
  instantDelivery: boolean;
  importantNote?: string;
  guide?: string;
  guideEnabled: boolean;
  subProducts?: Array<{
    _id: string;
    name: string;
    price: number;
    inStock: boolean;
  }>;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<IProduct[]>('/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <p className="text-sm"><strong>Region:</strong> {product.region}</p>
              <p className="text-sm"><strong>Instant Delivery:</strong> {product.instantDelivery ? 'Yes' : 'No'}</p>
              {product.importantNote && (
                <p className="text-sm text-red-500 mt-2"><strong>Important Note:</strong> {product.importantNote}</p>
              )}
              {product.guideEnabled && product.guide && (
                <p className="text-sm mt-2"><strong>Guide:</strong> {product.guide}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              {product.subProducts && product.subProducts.length > 0 && (
                <div className="w-full mb-4">
                  <h4 className="font-semibold mb-2">Sub Products:</h4>
                  {product.subProducts.map((subProduct) => (
                    <div key={subProduct._id} className="text-sm">
                      {subProduct.name} - ${subProduct.price} 
                      {subProduct.inStock ? ' (In Stock)' : ' (Out of Stock)'}
                    </div>
                  ))}
                </div>
              )}
              <Link href={`/products/${product._id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductList;