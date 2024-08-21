// File: src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { ObjectId } from "mongodb";
import cloudinary, { CloudinaryUploadResult } from "@/lib/cloudinary";
import streamifier from "streamifier";

const streamUpload = (buffer: Buffer): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const data = await request.formData();
    const title = data.get("title")?.toString();
    const region = data.get("region")?.toString();
    const instantDelivery = data.get("instantDelivery") === "true";
    const importantNote = data.get("importantNote")?.toString();
    const subProductsString = data.get("subProducts")?.toString();
    const image = data.get("image");

    if (!title || !region || subProductsString === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let subProducts;
    try {
      subProducts = JSON.parse(subProductsString);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid subProducts data" },
        { status: 400 }
      );
    }

    let updateData: any = {
      title,
      region,
      instantDelivery,
      importantNote,
      subProducts,
    };

    if (image instanceof Blob) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const result: CloudinaryUploadResult = await streamUpload(buffer);
      updateData.imageUrl = result.secure_url;
    }

    console.log("Updating product with data:", updateData);

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
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
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
