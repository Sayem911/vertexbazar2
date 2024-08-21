'use client';

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from 'next/navigation';

interface IProduct {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  region: string;
  instantDelivery: boolean;
  importantNote?: string;
  customFields: ICustomField[];
  subProducts: ISubProduct[];
  isIDBased: boolean;
  idFields?: { label: string }[];
}

interface ICustomField {
  name: string;
  type: "text" | "number" | "boolean";
  required: boolean;
  label: string;
}

interface ISubProduct {
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity?: number;
  inStock: boolean;
}

const API_URL = "/api/products";

async function fetchProducts(): Promise<IProduct[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete product");
}

export default function AdminProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <Button onClick={() => router.push('/admin/products/add')} className="mb-4">
        Add New Product
      </Button>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Instant Delivery</TableHead>
            <TableHead>Sub-products</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.region}</TableCell>
              <TableCell>{product.instantDelivery ? "Yes" : "No"}</TableCell>
              <TableCell>{product.subProducts.length}</TableCell>
              <TableCell>
                <Button onClick={() => router.push(`/admin/products/edit/${product._id}`)} className="mr-2">
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(product._id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
