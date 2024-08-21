import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  await dbConnect();
  const productId = request.nextUrl.searchParams.get('productId');
  try {
    const reviews = await Review.find(productId ? { productId } : {}).lean();
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch reviews', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  const { productId, user, content, rating } = data;

  try {
    const newReview = new Review({
      productId,
      user,
      content,
      rating,
    });
    await newReview.save();
    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create review', error: error.message }, { status: 500 });
  }
}
