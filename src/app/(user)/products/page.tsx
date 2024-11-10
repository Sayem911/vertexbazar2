"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ISubProduct {
  _id: string;
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
  category: 'GAME_CARD' | 'GAME_TOP_UP';
  popularity: 'POPULAR' | 'NEW' | 'REGULAR';
  displayOrder: number;
  countryCode: string;
  subProducts?: ISubProduct[];
}

interface ProductSectionProps {
  title: string;
  products: IProduct[];
  isLoading?: boolean;
  error?: string | null;
}

const ProductSkeleton = () => (
  <Card className="bg-gray-800 border-gray-700">
    <CardContent className="p-3">
      <div className="space-y-3">
        <Skeleton className="h-40 w-full bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/2 bg-gray-700" />
      </div>
    </CardContent>
  </Card>
);

const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => (
  <Link href={`/products/${product._id}`}>
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg cursor-pointer h-full">
      <CardContent className="p-3">
        <div className="relative aspect-square mb-2 overflow-hidden rounded-lg group">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-gray-400">
            {product.region}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.instantDelivery && (
              <span className="inline-block bg-blue-900/50 text-blue-200 text-xs px-2 py-0.5 rounded">
                Instant
              </span>
            )}
            {product.subProducts && product.subProducts.length > 0 && (
              <span className="inline-block bg-green-900/50 text-green-200 text-xs px-2 py-0.5 rounded">
                From ${Math.min(...product.subProducts.map(sp => sp.price))}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  products,
  isLoading,
  error
}) => {
  if (error) {
    return (
      <div className="text-red-400 p-4">
        Error loading {title}: {error}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">{title}</h2>
        {products.length > 4 && (
          <button className="flex items-center text-gray-400 hover:text-white text-sm transition-colors">
            View More
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
      <div className={cn(
        "grid gap-4",
        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {isLoading ? (
          Array(5).fill(0).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
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

  const filterProducts = (category: string, popularity: string) => {
    return products.filter(product => 
      product.category === category && 
      product.popularity === popularity
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="container mx-auto">
          {['POPULAR GAME CARD', 'POPULAR GAME TOP-UP', 'NEW GAME CARD', 'NEW GAME TOP-UP'].map((title) => (
            <ProductSection
              key={title}
              title={title}
              products={[]}
              isLoading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  const popularGameCards = filterProducts('GAME_CARD', 'POPULAR');
  const popularTopUps = filterProducts('GAME_TOP_UP', 'POPULAR');
  const newGameCards = filterProducts('GAME_CARD', 'NEW');
  const newTopUps = filterProducts('GAME_TOP_UP', 'NEW');

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <>
            {popularGameCards.length > 0 && (
              <ProductSection 
                title="Popular Game Card" 
                products={popularGameCards}
              />
            )}
            
            {popularTopUps.length > 0 && (
              <ProductSection 
                title="Popular Game Top-up" 
                products={popularTopUps}
              />
            )}
            
            {newGameCards.length > 0 && (
              <ProductSection 
                title="New Game Card" 
                products={newGameCards}
              />
            )}
            
            {newTopUps.length > 0 && (
              <ProductSection 
                title="New Game Top-up" 
                products={newTopUps}
              />
            )}

            {!popularGameCards.length && 
             !popularTopUps.length && 
             !newGameCards.length && 
             !newTopUps.length && (
              <div className="text-gray-400 text-center py-8">
                No products found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;