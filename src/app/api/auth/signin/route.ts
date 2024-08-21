import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { signJwtAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers'; // Import cookies utility from Next.js

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    const accessToken = signJwtAccessToken(userWithoutPassword);

    // Set the JWT as an HTTP-only cookie
    const response = NextResponse.json({ user: userWithoutPassword });
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true, // HTTP-only so it's not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Set secure flag in production
      path: '/', // Cookie is available site-wide
      maxAge: 60 * 60 * 24 * 7, // 7 days expiration
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
