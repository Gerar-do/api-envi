import mongoose, {  Schema } from 'mongoose';

/*
// IPublication.ts
export interface IPublication {
  id?: string;         // Añade el id
  title: string;
  description: string;
  type: 'free' | 'paid';
  price: number;
  userId: string;
  imageUrl: string;
  originalImageKey?: string;  // Añade originalImageKey como opcional
  // otros campos que puedas tener...
}

const publicationSchema = new Schema<IPublication>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['free', 'paid'], required: true },
  price: { type: Number, required: true },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
*/


export interface IPublication {
  id?: string;
  title: string;
  description: string;
  type: 'free' | 'paid';
  price: number;
  userId: string;
  imageUrl: string;
  originalImageKey?: string;
  commentCount?: number; // Para mantener cuenta de comentarios
}

const publicationSchema = new Schema<IPublication>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['free', 'paid'], required: true },
  price: { type: Number, required: true },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  commentCount: { type: Number, default: 0 }
});



export const Publication = mongoose.model<IPublication>('Publication', publicationSchema);