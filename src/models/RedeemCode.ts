import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRedeemCode extends Document {
  code: string;
  productId: mongoose.Types.ObjectId;
  isUsed: boolean;
  userId?: mongoose.Types.ObjectId; // Optional field to store the user who purchased it
}

const RedeemCodeSchema = new Schema<IRedeemCode>({
  code: { type: String, required: true, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  isUsed: { type: Boolean, required: true, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const RedeemCode: Model<IRedeemCode> = mongoose.models.RedeemCode || mongoose.model<IRedeemCode>('RedeemCode', RedeemCodeSchema);

export default RedeemCode;
