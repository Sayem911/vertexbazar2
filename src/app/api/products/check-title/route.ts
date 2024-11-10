// File: src/app/api/products/check-title/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  const { title } = await request.json();

  if (!title) {
    return NextResponse.json({ message: 'Title is required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const existingProduct = await Product.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    return NextResponse.json({ exists: !!existingProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Error checking product title:", error);
    return NextResponse.json({ message: 'Failed to check title', error: error.message }, { status: 500 });
  }
}
