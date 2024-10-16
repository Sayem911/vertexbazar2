// File Path: src/app/api/users/[id]/points/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";  // Assuming you have a User model in your models folder
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  try {
    const { vbPoints } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { vbPoints },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update VB points", error: error.message },
      { status: 500 }
    );
  }
}
