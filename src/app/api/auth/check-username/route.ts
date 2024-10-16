import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    // Check if the username exists
    const existingUser = await User.findOne({ username: username.trim() });

    if (existingUser) {
      return NextResponse.json({ available: false }, { status: 200 });
    } else {
      return NextResponse.json({ available: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error checking username:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
