import mongoose, { Document, Model, Schema } from 'mongoose';

interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  user: string;
  content: string;
  rating: number;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
