// File Path: src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary, { CloudinaryUploadResult } from '@/lib/cloudinary';
import streamifier from 'streamifier';

const streamUpload = (buffer: Buffer): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export async function POST(request: NextRequest) {
  await dbConnect();
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ message: 'Content-Type must be multipart/form-data' }, { status: 400 });
  }

  const data = await request.formData();
  const title = data.get('title')?.toString();
  const description = data.get('description')?.toString();
  const guide = data.get('guide')?.toString();
  const guideEnabled = data.get('guideEnabled') === 'true';
  const region = data.get('region')?.toString();
  const instantDelivery = data.get('instantDelivery') === 'true';
  const importantNote = data.get('importantNote')?.toString();
  const isIDBased = data.get('isIDBased') === 'true';
  const customFields = JSON.parse(data.get('customFields')?.toString() || '[]');
  const subProducts = JSON.parse(data.get('subProducts')?.toString() || '[]');
  const idFields = JSON.parse(data.get('idFields')?.toString() || '[]');
  const category = data.get('category')?.toString();
  const popularity = data.get('popularity')?.toString();
  const countryCode = data.get('countryCode')?.toString();
  const displayOrder = parseInt(data.get('displayOrder')?.toString() || '0');
  const image = data.get('image') as Blob;

  try {
    // Check if a product with the same title already exists
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return NextResponse.json({ message: 'A product with this title already exists' }, { status: 409 });
    }

    let imageUrl = '';

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const result: CloudinaryUploadResult = await streamUpload(buffer);
      imageUrl = result.secure_url;
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
      isIDBased,
      customFields,
      subProducts,
      idFields,
      category,
      popularity,
      countryCode,
      displayOrder
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const popularity = searchParams.get('popularity');
    const countryCode = searchParams.get('countryCode');

    let query: any = {};

    if (category) {
      query.category = category;
    }
    if (popularity) {
      query.popularity = popularity;
    }
    if (countryCode) {
      query.countryCode = countryCode;
    }

    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: 'Failed to load products', error: error.message }, { status: 500 });
  }
}