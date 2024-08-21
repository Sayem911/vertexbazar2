"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ISubProduct {
  name: string;
  price: number;
  inStock: boolean;
}

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
  subProducts: ISubProduct[];
}

const ProductPage = () => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const response = await axios.get<IProduct>(`/api/products/${productId}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!product) return <div className="text-center mt-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-full h-64 object-cover mb-4 rounded"
            />
          )}
          <p className="text-gray-700 mb-4">{product.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Region:</strong> {product.region}
            </div>
            <div>
              <strong>Instant Delivery:</strong> {product.instantDelivery ? 'Yes' : 'No'}
            </div>
          </div>
          {product.importantNote && (
            <p className="text-red-500 mb-4"><strong>Important Note:</strong> {product.importantNote}</p>
          )}
          {product.guideEnabled && product.guide && (
            <div className="mb-4">
              <strong>Guide:</strong>
              <p>{product.guide}</p>
            </div>
          )}
          {product.subProducts && product.subProducts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Sub Products:</h3>
              <ul className="list-disc pl-5">
                {product.subProducts.map((subProduct, index) => (
                  <li key={index} className="mb-1">
                    {subProduct.name} - ${subProduct.price.toFixed(2)} 
                    {subProduct.inStock ? ' (In Stock)' : ' (Out of Stock)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button onClick={() => router.push('/products')}>Back to Products</Button>
      </div>
    </div>
  );
};

export default ProductPage;