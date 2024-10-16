import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id: userId } = params;

  

  try {
    const orders = await Order.find({ userId }).lean();
    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { message: "No orders found for this user" },
        { status: 404 }
      );
    }
    return NextResponse.json(orders);
  } catch (error:any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}