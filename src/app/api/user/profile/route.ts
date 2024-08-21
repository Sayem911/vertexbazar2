import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from '@/models/User';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    const userId = session.user.id;

    // Check if userId is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    } else {
      // If not a valid ObjectId, assume it's a Google ID
      user = await User.findOne({ googleId: userId }).select('-password');
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}