// FIX: 'mongoose' default import removed as it was unused.
import { Schema, Document, models, model } from 'mongoose';

export interface IVacancy extends Document {
  title: string;
  department: string; // Added department based on previous logic
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  isActive: boolean; // Added isActive for showing/hiding
  createdAt: Date;
}

const VacancySchema: Schema = new Schema({
  title: { type: String, required: true },
  department: { type: String, required: true }, // Added department
  location: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] 
  },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // Added isActive
  createdAt: { type: Date, default: Date.now },
});

// This line prevents Mongoose from recompiling the model on every hot-reload
export default models.Vacancy || model<IVacancy>('Vacancy', VacancySchema);