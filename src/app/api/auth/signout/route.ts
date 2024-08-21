import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 401 });
    }

    // Clear the session
    await authOptions.callbacks?.jwt?.({ token: {}, trigger: 'signout' });
    await authOptions.callbacks?.session?.({ session: {}, token: {} });

    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear any cookies set by NextAuth
    response.cookies.set('next-auth.session-token', '', { 
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}