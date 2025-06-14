// src/lib/types.ts
export interface Item {
  _id: string; // Always a string after fetching/creation
  name: string;
  description: string;
  itemCode: string;
  imageBase64: string; // Assumed mandatory for an item
  userId: string;
  createdAt: Date; // Will be a Date object
  
}

export interface UserSession {
  userId: string;
  username: string;
  // any other session fields
}

export interface User {
  _id: string; // from MongoDB
  username: string;
  email?: string; // Assuming email is stored
  createdAt: Date;
  // Do NOT store passwords directly here for listing.
  // Add role or isAdmin if you store it on the user document
  isAdmin?: boolean;
}

// This is the structure we'll send to the frontend.
// Keep your existing types (Item, UserSession, User)

// Add these new types for the careers feature

export interface Vacancy {
  _id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  isActive: boolean; // To show/hide on the careers page
  createdAt: Date;
}

export interface Application {
  _id: string;
  vacancyId: string;
  vacancyTitle: string;
  fullName: string;
  email: string;
  phone: string;
  cvMimeType: string; // e.g., 'application/pdf'
  cvBase64: string; // CV stored as a Base64 string
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  createdAt: Date;
}