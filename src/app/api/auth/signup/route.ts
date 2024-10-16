import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { signJwtAccessToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { 
      username, 
      email, 
      password, 
      mobileNumber, 
      role,
      profileImage 
    } = await req.json();

    // Check if email or mobile number is provided
    if (!email && !mobileNumber) {
      return NextResponse.json({ 
        error: 'You must provide either an email or a mobile number.' 
      }, { status: 400 });
    }

    // Normalize email and mobile number if provided
    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
    const normalizedMobileNumber = mobileNumber ? mobileNumber.trim() : undefined;

    // Check if a user with the provided email already exists
    if (normalizedEmail) {
      const existingUserWithEmail = await User.findOne({ email: normalizedEmail });
      if (existingUserWithEmail) {
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please sign in or use a different email.' 
        }, { status: 400 });
      }
    }

    // Check if a user with the provided mobile number already exists
    if (normalizedMobileNumber) {
      const existingUserWithMobile = await User.findOne({ mobileNumber: normalizedMobileNumber });
      if (existingUserWithMobile) {
        return NextResponse.json({ 
          error: 'An account with this mobile number already exists. Please sign in or use a different mobile number.' 
        }, { status: 400 });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user document
    const newUser = new User({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      mobileNumber: normalizedMobileNumber,
      role: role || 'user',
      provider: 'local',
      profileImage,
      isEmailVerified: false,
      isMobileVerified: false
    });

    // Save the new user to the database
    await newUser.save();

    // Remove the password from the user object before signing the token
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    // Generate JWT token
    const accessToken = signJwtAccessToken(userWithoutPassword);

    // Create a response and set the JWT as an HTTP-only cookie
    const response = NextResponse.json({ 
      user: userWithoutPassword,
      accessToken
    }, { status: 201 });

    response.headers.set('Set-Cookie', `accessToken=${accessToken}; HttpOnly; Path=/; Secure; SameSite=Strict`);

    return response;
  } catch (error: any) {
    console.error('Error during user signup:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
