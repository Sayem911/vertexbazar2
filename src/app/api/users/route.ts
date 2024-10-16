// File Path: src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";  // Assuming you have a User model in your models folder

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}
