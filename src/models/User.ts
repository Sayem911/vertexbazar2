// File Path: src/models/User.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string; // Email is now optional
  mobileNumber?: string;
  password: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  role: string;
  provider: string;
  googleId?: string;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  profileImage?: string;
  accessToken?: string;
  vbPoints: number; // Adding VB Points field
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true }, // Email is optional and sparse
  mobileNumber: { type: String, unique: true, sparse: true }, // Mobile number is optional and sparse
  password: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  isMobileVerified: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  provider: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  verifyToken: { type: String },
  verifyTokenExpiry: { type: Date },
  profileImage: { type: String },
  accessToken: { type: String },
  vbPoints: { type: Number, default: 0 }, // Default VB Points to 0
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
