'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const API_URL = '/api/redeem-codes';

async function generateRedeemCodes(productId: string, quantity: number): Promise<void> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) throw new Error('Failed to generate redeem codes');
}

export default function AddRedeemCode() {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateRedeemCodes(productId, quantity);
      toast({
        title: 'Success',
        description: 'Redeem codes generated successfully.',
      });
    } catch (err) {
      console.error('Error generating redeem codes:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate redeem codes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generate Redeem Codes</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="productId">Product ID</Label>
          <Input
            id="productId"
            name="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />
        </div>
        <Button type="submit">Generate Codes</Button>
      </form>
    </div>
  );
}
