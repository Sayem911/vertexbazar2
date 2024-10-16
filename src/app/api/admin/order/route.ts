// File: /app/api/admin/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// GET request handler for fetching all orders (Admin use)
export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Fetch all orders from the database
    const orders = await Order.find();
    return NextResponse.json(orders, { status: 200 });
  } catch (error:any) {
    console.error('Error fetching orders:', error.message);
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
  }
}
