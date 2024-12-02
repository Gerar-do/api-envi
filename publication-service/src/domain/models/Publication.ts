import mongoose, { Document, Schema } from 'mongoose';

// IPublication.ts
export interface IPublication {
  _id?: string;
  title: string;
  description: string;
  type: 'free' | 'paid';
  price: number;
  userId: string;
  imageUrl: string;
}

const publicationSchema = new Schema<IPublication>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['free', 'paid'], required: true },
  price: { type: Number, required: true },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

export const Publication = mongoose.model<IPublication>('Publication', publicationSchema);