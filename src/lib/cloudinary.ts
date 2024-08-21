// File: src/lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
// File: src/lib/cloudinary.ts (or any other appropriate file)

export interface CloudinaryUploadResult {
    secure_url: string;
    [key: string]: any; // Include this to allow other properties from the Cloudinary response
  }
  