// File Path: src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error:any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const updatedData = await request.json();
    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error:any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error:any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
}