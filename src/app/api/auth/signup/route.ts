import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { signJwtAccessToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { 
      username, 
      email, 
      password, 
      mobileNumber, 
      role,
      profileImage 
    } = await req.json();

    // Ensure that at least one of email or mobile number is provided
    if (!email && !mobileNumber) {
      return NextResponse.json({ 
        error: 'You must provide either an email or a mobile number.' 
      }, { status: 400 });
    }

    // Set email or mobileNumber to undefined if not provided
    const normalizedEmail = email || undefined;
    const normalizedMobileNumber = mobileNumber || undefined;

    // Construct the query to check for existing users
    const existingUserQuery: any = { username };
    if (normalizedEmail !== undefined) {
      existingUserQuery.email = normalizedEmail;
    }
    if (normalizedMobileNumber !== undefined) {
      existingUserQuery.mobileNumber = normalizedMobileNumber;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [existingUserQuery] });

    if (existingUser) {
      let errorMessage = 'User already exists with this ';
      if (existingUser.email === normalizedEmail) errorMessage += 'email';
      else if (existingUser.username === username) errorMessage += 'username';
      else if (existingUser.mobileNumber === normalizedMobileNumber) errorMessage += 'mobile number';
      console.log(errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
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

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    const accessToken = signJwtAccessToken(userWithoutPassword);

    // Create a response and set the JWT as an HTTP-only cookie
    const response = NextResponse.json({ user: userWithoutPassword }, { status: 201 });
   

    return response;
  } catch (error:any) {
    console.error('Error during user signup:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}