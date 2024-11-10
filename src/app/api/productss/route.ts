import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  const {
    title,
    description,
    guide,
    guideEnabled,
    imageUrl,
    region,
    instantDelivery,
    importantNote,
    customFields,
    subProducts,
    isIDBased,
    idFields,
    category  // Added category here
  } = data;

  try {
    // Check if a product with the same title or category already exists
    const existingCategory = await Product.findOne({ category });
    if (existingCategory) {
      return NextResponse.json({ message: 'Category already exists' }, { status: 409 });
    }

    const newProduct = new Product({
      title,
      description,
      guide,
      guideEnabled,
      imageUrl,
      region,
      instantDelivery,
      importantNote,
      customFields,
      subProducts,
      isIDBased,
      idFields,
      category,  // Save category
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
  }
}
