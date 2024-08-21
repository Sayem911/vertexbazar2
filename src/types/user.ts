import mongoose, { Schema, Document, models, model } from "mongoose";

// Define an interface representing a document in MongoDB
export interface IUser extends Document {
  username?: string;
  email: string;
  mobileNumber?: string;
  password: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  role: string;
  provider: string;
  googleId?: string;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  profileImage: string;
}

// Create the schema corresponding to the document interface
const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values for users signing in with Google
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow null values if mobileNumber is not provided
  },
  password: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"], // Ensure role is either 'user' or 'admin'
  },
  provider: {
    type: String,
    default: "custom",
    enum: ["custom", "google"], // Ensure provider is either 'custom' or 'google'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values for non-Google sign-ins
  },
  verifyToken: String,
  verifyTokenExpiry: Date,
  profileImage: {
    type: String,
    default:
      "https://res.cloudinary.com/dqasy9uyp/image/upload/v1723025875/products/hdmusgsifmucqmrsfanq.jpg",
  },
});

// Create and export the model
const User = models.User || model<IUser>("User", userSchema);

export default User;
