// src/lib/types.ts

// =================================================================
// E-COMMERCE & APPLICATION CORE TYPES
// =================================================================

/**
 * Represents a product/item in your store.
 * This interface combines backend fields (_id, userId) with frontend
 * e-commerce requirements (price, inStock, rating).
 */
export interface Item {
  // --- Core Database Fields ---
  _id: string;
  name: string;
  description: string;
  imageBase64: string;
  itemCode?: string; // Optional, as not all items might have a public code
  userId: string; // ID of the user/admin who created the item
  createdAt: Date;

  // --- E-commerce Fields (for the product card & logic) ---
  price: number;
  currency: 'LKR' | 'USD' | 'EUR' | 'GBP'; // Extend this union type with more currencies as needed
  inStock: boolean;
  originalPrice?: number; // Optional: Used to show a 'sale' price next to a strikethrough price
     // Optional: A number from 0 to 5 for star ratings
}

/**
 * Represents the session data for a logged-in user.
 */
export interface UserSession {
  userId: string;
  username: string;
  isAdmin?: boolean; // Good to have for role-based access
}

/**
 * Represents a user document from the database.
 */
export interface User {
  _id: string;
  username:string;
  email?: string;
  createdAt: Date;
  isAdmin?: boolean;
}


// =================================================================
// CAREERS & RECRUITMENT TYPES
// =================================================================

/**
 * Represents a job vacancy posted on the careers page.
 */
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

/**
 * Represents a job application submitted by a candidate.
 */
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