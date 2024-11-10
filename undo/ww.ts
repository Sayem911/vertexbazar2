// File: src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary, { CloudinaryUploadResult } from '@/lib/cloudinary';
import streamifier from 'streamifier';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: 'Failed to load products', error: error.message }, { status: 500 });
  }
}

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
  const guide = data.get('guide')?.toString(); // Getting guide data
  const guideEnabled = data.get('guideEnabled') === 'true'; // Getting guideEnabled data
  const region = data.get('region')?.toString();
  const instantDelivery = data.get('instantDelivery') === 'true';
  const importantNote = data.get('importantNote')?.toString();
  const isIDBased = data.get('isIDBased') === 'true'; // Getting isIDBased data
  const customFields = JSON.parse(data.get('customFields')?.toString() || '[]');
  const subProducts = JSON.parse(data.get('subProducts')?.toString() || '[]');
  const idFields = JSON.parse(data.get('idFields')?.toString() || '[]');
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
      isIDBased, // Including isIDBased
      customFields,
      subProducts,
      idFields,
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error:any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
  }
}


// File: src/app/api/products/check-title/route.ts
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
