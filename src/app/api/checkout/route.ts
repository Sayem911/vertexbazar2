// File: /app/api/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { customAlphabet } from 'nanoid'; // Import customAlphabet from nanoid

// Create a customAlphabet with only numbers and uppercase letters
const generateOrderId = customAlphabet('1234567890', 10);

interface OrderPayload {
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

// POST handler to create a new order
export async function POST(req: NextRequest) {
  await dbConnect(); // Connect to MongoDB

  try {
    const body = await req.json();
    const {
      userId,
      name,
      phone,
      email,
      paymentMethod,
      bkashNumber,
      bkashTxnId,
      nagadNumber,
      upayNumber,
      products,
      totalAmount,
      status,
    }: OrderPayload = body;

    // Generate the orderId using the custom alphabet
    const orderId = generateOrderId(); // This generates a 10 character orderId

    // Create new order with structured status object
    const newOrder = new Order({
      userId,
      orderId, // Ensure we pass the generated orderId
      name,
      phone,
      email,
      paymentMethod,
      bkashNumber,
      bkashTxnId,
      nagadNumber,
      upayNumber,
      products,
      totalAmount,
      status: {
        value: status.value,
        rejectionReason: status.rejectionReason || "N/A", // Set rejectionReason if rejected
      },
    });

    await newOrder.save();

    return NextResponse.json(
      { message: 'Order saved successfully', order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { message: 'Failed to save order', error: error.message },
      { status: 500 }
    );
  }
}
