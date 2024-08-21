import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubProduct {
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity?: number;
  inStock: boolean; // New field for stock availability
}

export interface ICustomField {
  name: string;
  type: 'text' | 'number' | 'boolean';
  required: boolean;
  label: string;
}

export interface IProduct extends Document {
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
  isIDBased: boolean; // New field for ID based input
  idFields?: { label: string }[]; // New optional field for ID based input fields
}

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
  inStock: { type: Boolean, required: true }, // New field for stock availability
});

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, unique: true }, // Set title to be unique
  description: { type: String, required: true },
  guide: { type: String },
  guideEnabled: { type: Boolean, required: true },
  imageUrl: { type: String, required: true },
  region: { type: String, required: true },
  instantDelivery: { type: Boolean, required: true },
  importantNote: { type: String },
  customFields: [CustomFieldSchema],
  subProducts: [SubProductSchema],
  isIDBased: { type: Boolean, required: true }, // New field for ID based input
  idFields: { type: [{ label: { type: String } }], required: false }, // New optional field for ID based input fields
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
