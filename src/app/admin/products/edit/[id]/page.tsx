// File Path: src/app/admin/products/edit/[id]/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useParams } from 'next/navigation';
import CloudinaryImageUpload from "@/components/CloudinaryImageUpload";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface IProduct {
  _id: string;
  title: string;
  description: string;
  guide?: string;
  guideEnabled: boolean;
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

async function fetchProduct(id: string): Promise<IProduct> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

async function updateProduct(
  id: string,
  formData: FormData
): Promise<IProduct> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
}

export default function EditProduct() {
  const [currentProduct, setCurrentProduct] = useState<Partial<IProduct>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [subProductIndex, setSubProductIndex] = useState<number | null>(null);
  const [tempSubProduct, setTempSubProduct] = useState<Partial<ISubProduct>>({
    name: "",
    price: 0,
    originalPrice: 0,
    inStock: false,
  });
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const product = await fetchProduct(id);
      setCurrentProduct(product);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCurrentProduct((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(currentProduct).forEach(([key, value]) => {
        if (key === "customFields" || key === "subProducts" || key === "idFields") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await updateProduct(id, formData);
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      router.push('/admin/products');
    } catch (err) {
      console.error("Error updating product:", err);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (imageUrl: string, file: File) => {
    setCurrentProduct((prev) => ({ ...prev, imageUrl }));
    setImageFile(file); // Save the file to be appended to formData
  };

  const openSubProductDialog = (index: number | null = null) => {
    if (index !== null) {
      setTempSubProduct(currentProduct.subProducts?.[index] || {});
      setSubProductIndex(index);
    } else {
      setTempSubProduct({ name: "", price: 0, originalPrice: 0, inStock: false });
      setSubProductIndex(null);
    }
    setIsDialogOpen(true);
  };

  const closeSubProductDialog = () => {
    setIsDialogOpen(false);
    setTempSubProduct({ name: "", price: 0, originalPrice: 0, inStock: false });
    setSubProductIndex(null);
  };

  const handleSubProductSave = () => {
    const updatedSubProducts = [...(currentProduct.subProducts || [])];
    if (subProductIndex !== null) {
      updatedSubProducts[subProductIndex] = tempSubProduct as ISubProduct;
    } else {
      updatedSubProducts.push(tempSubProduct as ISubProduct);
    }
    setCurrentProduct((prev) => ({ ...prev, subProducts: updatedSubProducts }));
    closeSubProductDialog();
  };

  const removeSubProduct = (index: number) => {
    setCurrentProduct((prev) => ({
      ...prev,
      subProducts: (prev.subProducts || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input id="title" name="title" value={currentProduct.title || ""} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={currentProduct.description || ""} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="guideEnabled">Enable Guide</Label>
          <Checkbox id="guideEnabled" checked={currentProduct.guideEnabled || false} onCheckedChange={(checked) => handleCheckboxChange('guideEnabled', checked as boolean)} />
        </div>
        {currentProduct.guideEnabled && (
          <div>
            <Label htmlFor="guide">Guide</Label>
            <Textarea id="guide" name="guide" value={currentProduct.guide || ""} onChange={handleInputChange} />
          </div>
        )}
        <div>
          <Label htmlFor="image">Product Image</Label>
          <CloudinaryImageUpload onImageUpload={handleImageUpload} currentImageUrl={currentProduct.imageUrl || ""} />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Input id="region" name="region" value={currentProduct.region || ""} onChange={handleInputChange} required />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="instantDelivery" checked={currentProduct.instantDelivery || false} onCheckedChange={(checked) => handleCheckboxChange('instantDelivery', checked as boolean)} />
          <Label htmlFor="instantDelivery">Instant Delivery</Label>
        </div>
        <div>
          <Label htmlFor="importantNote">Important Note</Label>
          <Textarea id="importantNote" name="importantNote" value={currentProduct.importantNote || ""} onChange={handleInputChange} />
        </div>
        <div>
          <Label>Sub-products</Label>
          <div className="mb-4">
            <Button type="button" onClick={() => openSubProductDialog()}>Add Sub-product</Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {currentProduct.subProducts?.map((subProduct, index) => (
              <div key={index} className="border rounded p-4">
                <div className="font-bold">{subProduct.name}</div>
                <div>Price: ${subProduct.price}</div>
                <div>Original Price: ${subProduct.originalPrice}</div>
                <div>In Stock: {subProduct.inStock ? 'Yes' : 'No'}</div>
                <Button type="button" onClick={() => openSubProductDialog(index)} className="mt-2 mr-2">View Details</Button>
                <Button type="button" onClick={() => removeSubProduct(index)} variant="destructive" className="mt-2">Delete</Button>
              </div>
            ))}
          </div>
        </div>
        <Button type="submit" form="productForm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
        <Button className="ml-3">
          <Link href='/admin/products'> Go Back </Link>
        </Button>
      </form>

      {/* Sub-product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{subProductIndex !== null ? 'Edit' : 'Add'} Sub-product</DialogTitle>
            <DialogDescription>
              Fill out the details below to {subProductIndex !== null ? 'edit' : 'add'} a sub-product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subProductName">Sub-product Name</Label>
              <Input id="subProductName" name="name" value={tempSubProduct.name || ""} onChange={(e) => setTempSubProduct(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="subProductPrice">Price</Label>
              <Input type="number" id="subProductPrice" name="price" value={tempSubProduct.price || 0} onChange={(e) => setTempSubProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))} required />
            </div>
            <div>
              <Label htmlFor="subProductOriginalPrice">Original Price</Label>
              <Input type="number" id="subProductOriginalPrice" name="originalPrice" value={tempSubProduct.originalPrice || 0} onChange={(e) => setTempSubProduct(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="subProductInStock" checked={tempSubProduct.inStock || false} onCheckedChange={(checked) => setTempSubProduct(prev => ({ ...prev, inStock: checked as boolean }))} />
              <Label htmlFor="subProductInStock">In Stock</Label>
            </div>
            {tempSubProduct.inStock && (
              <div>
                <Label htmlFor="subProductStockQuantity">Stock Quantity</Label>
                <Input type="number" id="subProductStockQuantity" name="stockQuantity" value={tempSubProduct.stockQuantity || 0} onChange={(e) => setTempSubProduct(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) }))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSubProductSave}>Save</Button>
            <Button onClick={closeSubProductDialog} variant="ghost" className="ml-2">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}