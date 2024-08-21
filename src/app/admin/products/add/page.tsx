'use client';

import React, { useState } from "react";
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
import { useRouter } from 'next/navigation';
import CloudinaryImageUpload from "@/components/CloudinaryImageUpload";
import Link from "next/link";

interface IProduct {
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

async function createProduct(formData: FormData): Promise<IProduct> {
  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to create product");
  return response.json();
}

async function checkTitleExists(title: string): Promise<boolean> {
  const response = await fetch('/api/products/check-title', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  if (!response.ok) throw new Error("Failed to check title");
  const data = await response.json();
  return data.exists;
}

export default function AddProduct() {
  const [currentProduct, setCurrentProduct] = useState<Partial<IProduct>>({
    title: "",
    description: "",
    guide: "",
    guideEnabled: false,
    imageUrl: "",
    region: "",
    instantDelivery: false,
    importantNote: "",
    customFields: [],
    subProducts: [],
    isIDBased: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [titleExists, setTitleExists] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
    if (name === "title") {
      checkTitleExists(value).then(exists => setTitleExists(exists));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCurrentProduct((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubProductChange = (
    index: number,
    field: keyof ISubProduct,
    value: string | number | boolean
  ) => {
    const updatedSubProducts = [...(currentProduct.subProducts || [])];
    updatedSubProducts[index] = {
      ...updatedSubProducts[index],
      [field]: value,
    };
    setCurrentProduct((prev) => ({ ...prev, subProducts: updatedSubProducts }));
  };

  const addSubProduct = () => {
    setCurrentProduct((prev) => ({
      ...prev,
      subProducts: [
        ...(prev.subProducts || []),
        { name: "", price: 0, originalPrice: 0, inStock: false },
      ],
    }));
  };

  const removeSubProduct = (index: number) => {
    setCurrentProduct((prev) => ({
      ...prev,
      subProducts: (prev.subProducts || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (titleExists) {
      toast({
        title: "Warning",
        description: "A product with this title already exists.",
        variant: "destructive",
      });
      return
      <>
      
      </>;
    }
    try {
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

      await createProduct(formData);
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
      router.push('/admin/products');
    } catch (err) {
      console.error("Error creating product:", err);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (imageUrl: string, file: File) => {
    setCurrentProduct((prev) => ({ ...prev, imageUrl }));
    setImageFile(file);  // Save the file to be appended to formData
  };

  const addIdField = () => {
    const updatedIdFields = [...(currentProduct.idFields || []), { label: "" }];
    setCurrentProduct((prev) => ({ ...prev, idFields: updatedIdFields }));
  };

  const removeIdField = (fieldIndex: number) => {
    const updatedIdFields = (currentProduct.idFields || []).filter(
      (_, i) => i !== fieldIndex
    );
    setCurrentProduct((prev) => ({ ...prev, idFields: updatedIdFields }));
  };

  const handleIdFieldChange = (
    fieldIndex: number,
    value: string
  ) => {
    const updatedIdFields = [...(currentProduct.idFields || [])];
    updatedIdFields[fieldIndex].label = value;
    setCurrentProduct((prev) => ({ ...prev, idFields: updatedIdFields }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input
            id="title"
            name="title"
            value={currentProduct.title}
            onChange={handleInputChange}
            required
          />
          {titleExists && (
            <p className="text-red-500 mt-1">A product with this title already exists.</p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={currentProduct.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="guideEnabled">Enable Guide</Label>
          <Checkbox
            id="guideEnabled"
            checked={currentProduct.guideEnabled}
            onCheckedChange={(checked) =>
              handleCheckboxChange("guideEnabled", checked as boolean)
            }
          />
        </div>
        {currentProduct.guideEnabled && (
          <div>
            <Label htmlFor="guide">Guide</Label>
            <Textarea
              id="guide"
              name="guide"
              value={currentProduct.guide}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div>
          <Label htmlFor="image">Product Image</Label>
          <CloudinaryImageUpload
            onImageUpload={handleImageUpload}
            currentImageUrl={currentProduct.imageUrl}
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="region"
            value={currentProduct.region}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="instantDelivery"
            checked={currentProduct.instantDelivery}
            onCheckedChange={(checked) =>
              handleCheckboxChange("instantDelivery", checked as boolean)
            }
          />
          <Label htmlFor="instantDelivery">Instant Delivery</Label>
        </div>
        <div>
          <Label htmlFor="importantNote">Important Note</Label>
          <Textarea
            id="importantNote"
            name="importantNote"
            value={currentProduct.importantNote}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="isIDBased">ID Based</Label>
          <Select
            value={currentProduct.isIDBased ? "yes" : "no"}
            onValueChange={(value) =>
              setCurrentProduct((prev) => ({ ...prev, isIDBased: value === "yes" }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="ID Based" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {currentProduct.isIDBased && (
            <div>
              <Label>ID Fields</Label>
              {currentProduct.idFields?.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-center space-x-2">
                  <Input
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) =>
                      handleIdFieldChange(fieldIndex, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    onClick={() => removeIdField(fieldIndex)}
                    variant="destructive"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addIdField}>
                Add ID Field
              </Button>
            </div>
          )}
        </div>
        <div>
          <Label>Sub-products</Label>
          {currentProduct.subProducts?.map((subProduct, index) => (
            <div key={index} className="space-y-2 mb-4 p-4 border rounded">
              <Input
                placeholder="Sub-product Name"
                value={subProduct.name}
                onChange={(e) =>
                  handleSubProductChange(index, "name", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Price"
                value={subProduct.price}
                onChange={(e) =>
                  handleSubProductChange(
                    index,
                    "price",
                    parseFloat(e.target.value)
                  )
                }
              />
              <Input
                type="number"
                placeholder="Original Price"
                value={subProduct.originalPrice}
                onChange={(e) =>
                  handleSubProductChange(
                    index,
                    "originalPrice",
                    parseFloat(e.target.value)
                  )
                }
              />
              <Select
                value={subProduct.inStock ? "yes" : "no"}
                onValueChange={(value) =>
                  handleSubProductChange(
                    index,
                    "inStock",
                    value === "yes"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="In Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {subProduct.inStock && (
                <Input
                  type="number"
                  placeholder="Stock Quantity"
                  value={subProduct.stockQuantity}
                  onChange={(e) =>
                    handleSubProductChange(
                      index,
                      "stockQuantity",
                      parseInt(e.target.value)
                    )
                  }
                />
              )}
              <Button
                type="button"
                onClick={() => removeSubProduct(index)}
                variant="destructive"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addSubProduct}>
            Add Sub-product
          </Button>
        </div>
        <Button type="submit" form="productForm">
          Save Product
        </Button>
      
        <Button className="ml-3">
          <Link href='/admin/products'> Go Back </Link>
        </Button>
      </form>
    </div>
  );
}
