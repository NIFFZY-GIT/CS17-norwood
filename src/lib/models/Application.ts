import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  cvPath: string; // We store the path to the uploaded file
  vacancy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cvPath: { type: String, required: true },
  vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Application || model<IApplication>('Application', ApplicationSchema);