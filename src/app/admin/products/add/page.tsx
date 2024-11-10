'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
import { ProductCategory, ProductPopularity, IProduct, ISubProduct } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Omit _id since it's not needed for creation
type CreateProductData = Omit<IProduct, '_id'>;

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

function AddProduct() {
  const [currentProduct, setCurrentProduct] = useState<Partial<CreateProductData>>({
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
    category: undefined,
    popularity: ProductPopularity.REGULAR,
    countryCode: "",
    displayOrder: 0,
  });

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
  const [titleExists, setTitleExists] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const steps = [
    { title: "Basic Info", progress: 25 },
    { title: "Details", progress: 50 },
    { title: "Sub-products", progress: 75 },
    { title: "Advanced", progress: 100 }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle different input types
    let processedValue: any = value;
    
    // Handle number inputs
    if (e.target.type === 'number') {
      processedValue = e.target.value === '' ? 0 : Number(value);
    }
    
    // Update state
    setCurrentProduct((prev) => ({ ...prev, [name]: processedValue }));

    // Check title existence if title field changes
    if (name === 'title' && value.trim()) {
      checkTitleExists(value).then(exists => setTitleExists(exists));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCurrentProduct((prev) => {
      // Special handling for guideEnabled checkbox
      if (name === 'guideEnabled' && !checked) {
        return { ...prev, [name]: checked, guide: '' };
      }
      // Special handling for isIDBased checkbox
      if (name === 'isIDBased') {
        return {
          ...prev,
          [name]: checked,
          idFields: checked ? [{ label: '' }] : []
        };
      }
      return { ...prev, [name]: checked };
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          currentProduct.title &&
          currentProduct.category &&
          currentProduct.region &&
          currentProduct.countryCode &&
          currentProduct.description &&
          !titleExists
        );
      case 1:
        return !!(
          currentProduct.popularity &&
          (!currentProduct.guideEnabled || (currentProduct.guideEnabled && currentProduct.guide))
        );
      case 2:
        return true; // Sub-products are optional
      case 3:
        return !!(
          (!currentProduct.isIDBased || 
            (currentProduct.isIDBased && 
             currentProduct.idFields && 
             currentProduct.idFields.length > 0 && 
             currentProduct.idFields.every(field => field.label)))
        );
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for this step.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps before submission
    for (let i = 0; i < totalSteps; i++) {
      if (!isStepValid(i)) {
        setCurrentStep(i);
        toast({
          title: "Validation Error",
          description: `Please complete all required fields in ${steps[i].title}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      const dataToSubmit = {
        ...currentProduct,
        subProducts: currentProduct.subProducts || [],
        idFields: currentProduct.idFields || [],
        customFields: currentProduct.customFields || [],
        guideEnabled: Boolean(currentProduct.guideEnabled),
        instantDelivery: Boolean(currentProduct.instantDelivery),
        isIDBased: Boolean(currentProduct.isIDBased),
        displayOrder: Number(currentProduct.displayOrder || 0),
      };

      // Append all fields to FormData
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        if (key === 'subProducts' || key === 'idFields' || key === 'customFields') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (value !== null && value !== undefined) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (imageUrl: string, file: File) => {
    setCurrentProduct((prev) => ({ ...prev, imageUrl }));
    setImageFile(file);
  };

  const openSubProductDialog = (index: number | null = null) => {
    if (index !== null && currentProduct.subProducts) {
      setTempSubProduct(currentProduct.subProducts[index]);
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
    if (!tempSubProduct.name || tempSubProduct.price === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for the sub-product.",
        variant: "destructive",
      });
      return;
    }

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
      subProducts: prev.subProducts?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${steps[currentStep].progress}%` }}
          />
        </div>
      </div>
      
      <form id="productForm" onSubmit={handleSubmit}>
        <div className="min-h-[500px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={currentProduct.title}
                    onChange={handleInputChange}
                    required
                  />
                  {titleExists && (
                    <p className="text-red-500 text-sm">Product title already exists.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={currentProduct.category}
                    onValueChange={(value) => 
                      setCurrentProduct(prev => ({ ...prev, category: value as ProductCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProductCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input 
                    id="region" 
                    name="region" 
                    value={currentProduct.region || ""} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="countryCode">Country Code *</Label>
                  <Input
                    id="countryCode"
                    name="countryCode"
                    value={currentProduct.countryCode}
                    onChange={handleInputChange}
                    placeholder="e.g., US, UK, JP"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={currentProduct.description || ""} 
                    onChange={handleInputChange} 
                    required 
                    className="h-20"
                  />
                </div>
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="popularity">Popularity Status *</Label>
                  <Select
                    value={currentProduct.popularity}
                    onValueChange={(value) => 
                      setCurrentProduct(prev => ({ ...prev, popularity: value as ProductPopularity }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select popularity status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProductPopularity).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={currentProduct.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox 
                        id="guideEnabled" 
                        checked={currentProduct.guideEnabled || false} 
                        onCheckedChange={(checked) => handleCheckboxChange('guideEnabled', checked as boolean)} 
                      />
                      <Label htmlFor="guideEnabled">Enable Guide</Label>
                    </div>
                    {currentProduct.guideEnabled && (
                      <Textarea 
                        id="guide" 
                        name="guide" 
                        value={currentProduct.guide || ""} 
                        onChange={handleInputChange}
                        required 
                        className="h-20"
                      />
                    )}
                  </Card>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Product Image *</Label>
                  <CloudinaryImageUpload 
                    onImageUpload={handleImageUpload} 
                    currentImageUrl={currentProduct.imageUrl || ""} 
                  />
                 </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sub-products</h3>
                <Button type="button" onClick={() => openSubProductDialog()}>
                  Add Sub-product
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {currentProduct.subProducts?.map((subProduct, index) => (
                  <Card key={index} className="p-4">
                    <div className="font-bold">{subProduct.name}</div>
                    <div className="text-sm">Price: ${subProduct.price}</div>
                    <div className="text-sm">Original: ${subProduct.originalPrice}</div>
                    <div className="text-sm">Stock: {subProduct.inStock ? 
                      (subProduct.stockQuantity !== undefined ? subProduct.stockQuantity : '∞') : 
                      'Out of stock'}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => openSubProductDialog(index)}
                      >
                        Edit
                      </Button>
                      <Button 
                        type="button" 
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSubProduct(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="instantDelivery" 
                      checked={currentProduct.instantDelivery || false} 
                      onCheckedChange={(checked) => handleCheckboxChange('instantDelivery', checked as boolean)} 
                    />
                    <Label htmlFor="instantDelivery">Instant Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isIDBased" 
                      checked={currentProduct.isIDBased || false} 
                      onCheckedChange={(checked) => {
                        setCurrentProduct(prev => ({ 
                          ...prev, 
                          isIDBased: checked as boolean,
                          idFields: checked ? [{ label: '' }] : [] 
                        }));
                      }} 
                    />
                    <Label htmlFor="isIDBased">Is ID Based</Label>
                  </div>
                  {currentProduct.isIDBased && (
                    <div className="col-span-2 space-y-2">
                      {currentProduct.idFields?.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={field.label}
                            onChange={(e) => {
                              const newIdFields = [...(currentProduct.idFields || [])];
                              newIdFields[index] = { label: e.target.value };
                              setCurrentProduct(prev => ({ ...prev, idFields: newIdFields }));
                            }}
                            placeholder="Field Label"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newIdFields = [...(currentProduct.idFields || [])].filter((_, i) => i !== index);
                              setCurrentProduct(prev => ({ ...prev, idFields: newIdFields }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          const newIdFields = [...(currentProduct.idFields || []), { label: '' }];
                          setCurrentProduct(prev => ({ ...prev, idFields: newIdFields }));
                        }}
                      >
                        Add ID Field
                      </Button>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label htmlFor="importantNote">Important Note</Label>
                    <Textarea 
                      id="importantNote" 
                      name="importantNote" 
                      value={currentProduct.importantNote || ""} 
                      onChange={handleInputChange}
                      className="h-20" 
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <div>
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link href='/admin/products'>Cancel</Link>
            </Button>
            
            {currentStep < totalSteps - 1 ? (
              <Button 
                type="button"
                onClick={handleNextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting || !isStepValid(currentStep)}
              >
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{subProductIndex !== null ? 'Edit' : 'Add'} Sub-product</DialogTitle>
            <DialogDescription>
              Fill out the details below to {subProductIndex !== null ? 'edit' : 'add'} a sub-product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subProductName">Sub-product Name *</Label>
              <Input 
                id="subProductName" 
                value={tempSubProduct.name || ""} 
                onChange={(e) => setTempSubProduct(prev => ({ ...prev, name: e.target.value }))} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="subProductPrice">Price *</Label>
              <Input 
                type="number" 
                id="subProductPrice" 
                value={tempSubProduct.price || 0} 
                onChange={(e) => setTempSubProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))} 
                required 
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="subProductOriginalPrice">Original Price</Label>
              <Input 
                type="number" 
                id="subProductOriginalPrice" 
                value={tempSubProduct.originalPrice || 0} 
                onChange={(e) => setTempSubProduct(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="subProductInStock" 
                checked={tempSubProduct.inStock || false} 
                onCheckedChange={(checked) => setTempSubProduct(prev => ({ ...prev, inStock: checked as boolean }))} 
              />
              <Label htmlFor="subProductInStock">In Stock</Label>
            </div>
            {tempSubProduct.inStock && (
              <div>
                <Label htmlFor="subProductStockQuantity">Stock Quantity</Label>
                <Input 
                  type="number" 
                  id="subProductStockQuantity" 
                  value={tempSubProduct.stockQuantity || 0} 
                  onChange={(e) => setTempSubProduct(prev => ({ 
                    ...prev, 
                    stockQuantity: parseInt(e.target.value) 
                  }))} 
                  min="0"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubProductSave}
                disabled={!tempSubProduct.name || tempSubProduct.price === undefined || tempSubProduct.price < 0}
              >
                Save
              </Button>
              <Button onClick={closeSubProductDialog} variant="outline">
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddProduct;
