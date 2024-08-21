import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  await dbConnect();
  const { title } = await request.json();

  try {
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return NextResponse.json({ exists: true }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to check title', error: error.message }, { status: 500 });
  }
}
