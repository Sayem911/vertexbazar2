
// File: src/models/Product.ts
import mongoose, { Model, Schema } from 'mongoose';
import { IProduct, ICustomField, ISubProduct, ProductCategory, ProductPopularity } from '@/types/product';

const CustomFieldSchema = new Schema<ICustomField>({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'boolean'], required: true },
  required: { type: Boolean, required: true },
  label: { type: String, required: true },
});

const SubProductSchema = new Schema<ISubProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  stockQuantity: { type: Number },
  inStock: { type: Boolean, required: true },
});

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  guide: { type: String },
  guideEnabled: { type: Boolean, required: true },
  imageUrl: { type: String, required: true },
  region: { type: String, required: true },
  instantDelivery: { type: Boolean, required: true },
  importantNote: { type: String },
  customFields: [CustomFieldSchema],
  subProducts: [SubProductSchema],
  isIDBased: { type: Boolean, required: true },
  idFields: { type: [{ label: { type: String } }], required: false },
  category: { 
    type: String, 
    enum: Object.values(ProductCategory),
    required: true 
  },
  popularity: { 
    type: String, 
    enum: Object.values(ProductPopularity),
    default: ProductPopularity.REGULAR 
  },
  countryCode: { 
    type: String, 
    required: true 
  },
  displayOrder: { 
    type: Number, 
    default: 0 
  }
});

ProductSchema.index({ category: 1, popularity: 1, displayOrder: 1 });
ProductSchema.index({ category: 1, countryCode: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;