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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from 'next/navigation';
import Image from "next/image";

// Define the enums with proper typing
export const ProductCategory = {
  GAME_CARD: 'GAME_CARD',
  GAME_TOP_UP: 'GAME_TOP_UP',
} as const;

export const ProductPopularity = {
  POPULAR: 'POPULAR',
  NEW: 'NEW',
  REGULAR: 'REGULAR',
} as const;

// Define types from the const enums
export type ProductCategoryType = typeof ProductCategory[keyof typeof ProductCategory];
export type ProductPopularityType = typeof ProductPopularity[keyof typeof ProductPopularity];

// Product interface
interface IProduct {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  region: string;
  instantDelivery: boolean;
  category: ProductCategoryType | undefined;
  popularity: ProductPopularityType;
  countryCode: string;
  displayOrder: number;
  subProducts: Array<{
    name: string;
    price: number;
    originalPrice: number;
    stockQuantity?: number;
    inStock: boolean;
  }>;
}

const API_URL = "/api/products";

async function fetchProducts(
  params: Record<string, ProductCategoryType | ProductPopularityType | string> = {}
): Promise<IProduct[]> {
  try {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`${API_URL}${queryString ? `?${queryString}` : ''}`, {
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

export default function AdminProducts() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryType | 'all'>('all');
  const [popularityFilter, setPopularityFilter] = useState<ProductPopularityType | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');  // Updated initial value
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, ProductCategoryType | ProductPopularityType | string> = {};
      
      // Only add filters if they are not set to "all"
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (popularityFilter !== 'all') params.popularity = popularityFilter;
      if (countryFilter !== 'all') params.countryCode = countryFilter;  // Updated condition
      
      const fetchedProducts = await fetchProducts(params);
      if (Array.isArray(fetchedProducts)) {
        setProducts(fetchedProducts);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadProducts();
    }
  }, [mounted, categoryFilter, popularityFilter, countryFilter]);

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    const productId = productToDelete;
    const originalProducts = [...products];
    setDeletingProducts(prev => new Set(prev).add(productId));

    try {
      const success = await deleteProduct(productId);
      if (success) {
        setProducts(products.filter((p) => p._id !== productId));
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setProducts(originalProducts);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  const getUniqueCountries = () => {
    const countries = new Set(products.map(p => p.countryCode));
    return Array.from(countries);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (typeof window === 'undefined') return null;
  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button 
          onClick={() => router.push('/admin/products/add')}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Add New Product
        </Button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Category Filter */}
        <Select 
          value={categoryFilter}
          onValueChange={(value: string) => setCategoryFilter(value as ProductCategoryType | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(ProductCategory).map((value) => (
              <SelectItem key={value} value={value}>
                {value.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Popularity Filter */}
        <Select 
          value={popularityFilter}
          onValueChange={(value: string) => setPopularityFilter(value as ProductPopularityType | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by popularity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(ProductPopularity).map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country Filter */}
        <Select 
          value={countryFilter}
          onValueChange={setCountryFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {getUniqueCountries().map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Popularity</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Sub-products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="relative w-10 h-10">
                      <Image
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.title}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.category ? product.category.replace('_', ' ') : 'No Category'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      product.popularity === ProductPopularity.POPULAR
                        ? 'bg-green-100 text-green-800'
                        : product.popularity === ProductPopularity.NEW
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.popularity}
                    </span>
                  </TableCell>
                  <TableCell>{product.region}</TableCell>
                  <TableCell>{product.countryCode}</TableCell>
                  <TableCell className="text-center">{product.displayOrder}</TableCell>
                  <TableCell className="text-center">{product.subProducts.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                        className="text-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteClick(product._id)}
                        disabled={deletingProducts.has(product._id)}
                        className="text-sm"
                      >
                        {deletingProducts.has(product._id) ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">No products found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}