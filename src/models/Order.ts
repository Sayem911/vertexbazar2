// File: /models/Order.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { customAlphabet } from "nanoid"; // For generating short unique IDs

const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10); // Adjust the length as needed

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  paymentMethod: string;
  bkashNumber?: string;
  bkashTxnId?: string;
  nagadNumber?: string;
  upayNumber?: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: {
    value: string;
    rejectionReason?: string;
  };
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, unique: true, required: true }, // Custom order ID
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    paymentMethod: { type: String, required: true },
    bkashNumber: { type: String },
    bkashTxnId: { type: String },
    nagadNumber: { type: String },
    upayNumber: { type: String },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      value: { type: String, required: true },
      rejectionReason: { type: String, default: "N/A" },
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate unique order ID
OrderSchema.pre<IOrder>("save", async function (next) {
  if (!this.orderId) {
    let isUnique = false;
    while (!isUnique) {
      const generatedId = nanoid(); // Generate short unique ID
      const existingOrder = await mongoose.models.Order.findOne({ orderId: generatedId });
      if (!existingOrder) {
        this.orderId = generatedId; // Set the unique ID
        isUnique = true;
      }
    }
  }
  next();
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
