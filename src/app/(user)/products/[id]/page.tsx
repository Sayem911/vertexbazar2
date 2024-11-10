// File: src/app/products/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';

interface ISubProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
  stockQuantity?: number;
}

interface ICustomField {
  name: string;
  type: 'text' | 'number' | 'boolean';
  label: string;
  required: boolean;
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
  customFields: ICustomField[];
  isIDBased: boolean;
  idFields?: { label: string }[];
}

const ProductPage = () => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubProduct, setSelectedSubProduct] = useState<ISubProduct | null>(null);
  const [idValues, setIdValues] = useState<Record<string, string>>({});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const handleSubProductSelect = (subProduct: ISubProduct) => {
    if (subProduct.inStock) {
      setSelectedSubProduct(subProduct);
    }
  };

  const handleIdFieldChange = (field: string, value: string) => {
    setIdValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (field: string, value: string | number | boolean) => {
    setCustomFieldValues(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToCart = () => {
    if (selectedSubProduct) {
      addToCart({
        _id: selectedSubProduct._id,
        name: selectedSubProduct.name,
        price: selectedSubProduct.price,
        quantity: 1,
      });

      setNotification(`"${selectedSubProduct.name}" has been added to your cart.`);

      setSelectedSubProduct(null);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!product) return <div className="text-center mt-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
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
            </div>
            <div>
              <h3 className="font-semibold mb-2">Select a Sub Product:</h3>
              <div className="space-y-2">
                {product.subProducts.map((subProduct) => (
                  <Button
                    key={subProduct._id}
                    variant={selectedSubProduct?._id === subProduct._id ? "default" : "outline"}
                    className="w-full justify-between"
                    onClick={() => handleSubProductSelect(subProduct)}
                    disabled={!subProduct.inStock} // Disable if not in stock
                  >
                    <span>{subProduct.name}</span>
                    <span>৳{subProduct.price.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
              {product.isIDBased && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">ID Information:</h3>
                  {product.idFields?.map((field) => (
                    <div key={field.label} className="mb-2">
                      <Label htmlFor={field.label}>{field.label}</Label>
                      <Input
                        id={field.label}
                        value={idValues[field.label] || ''}
                        onChange={(e) => handleIdFieldChange(field.label, e.target.value)}
                        placeholder={`Enter ${field.label}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              {product.customFields.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Custom Fields:</h3>
                  {product.customFields.map((field) => (
                    <div key={field.name} className="mb-2">
                      <Label htmlFor={field.name}>{field.label}</Label>

                      {field.type === 'text' && (
                        <Input
                          id={field.name}
                          value={(customFieldValues[field.name] as string) || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label}`}
                        />
                      )}

                      {field.type === 'number' && (
                        <Input
                          id={field.name}
                          type="number"
                          value={(customFieldValues[field.name] as number) || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, parseFloat(e.target.value))}
                          placeholder={`Enter ${field.label}`}
                        />
                      )}

                      {field.type === 'boolean' && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={field.name}
                            checked={!!customFieldValues[field.name]}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.checked)}
                          />
                          <Label htmlFor={field.name} className="ml-2">
                            {field.label}
                          </Label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Order Summary:</h3>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>৳{selectedSubProduct?.price.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleAddToCart} disabled={!selectedSubProduct}>
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button onClick={() => router.push('/products')}>Back to Products</Button>
      </div>

      {hasMounted && notification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
