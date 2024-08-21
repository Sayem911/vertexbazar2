import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RedeemCode from '@/models/RedeemCode';
import Product from '@/models/Product';
import { v4 as uuidv4 } from 'uuid'; // Use uuid to generate unique codes

export async function POST(request: NextRequest) {
  await dbConnect();

  const { productId, quantity } = await request.json();

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const code = uuidv4();
      codes.push({ code, productId });
    }

    await RedeemCode.insertMany(codes);

    return NextResponse.json({ message: 'Redeem codes generated successfully' }, { status: 201 });
  } catch (error: any) {
    console.error("Error generating redeem codes:", error);
    return NextResponse.json({ message: 'Failed to generate redeem codes', error: error.message }, { status: 500 });
  }
}
