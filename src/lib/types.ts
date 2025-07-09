// src/lib/types.ts

// =================================================================
// E-COMMERCE & APPLICATION CORE TYPES
// =================================================================

/**
 * Represents a product/item in your store.
 */
export interface Item {
  _id: string;
  name: string;
  description: string;
  imageBase64: string;
  itemCode?: string;
  userId: string;
  createdAt: Date;
  price: number;
  currency: 'LKR' | 'USD' | 'EUR' | 'GBP';
  inStock: boolean;
  originalPrice?: number;
  // --- RECOMMENDATION ATTRIBUTES ---
  category: 'Snacks' | 'Bites' | 'Drinks' | string; // Base category
  tags: ('salty' | 'sweet' | 'spicy' | 'healthy' | 'morning' | 'afternoon' | 'night')[]; // Descriptive tags
}
/**
 * Represents the quiz preferences a user can select.
 */
export interface QuizPrefs {
  category?: 'Snacks' | 'Bites';
  time?: 'Morning' | 'Afternoon' | 'Night' | 'Anytime';
  frequency?: 'Once' | '2-3 times' | 'Frequently' | 'Rarely';
}

/**
 * Represents the session data for a logged-in user.
 */
export interface UserSession {
  userId: string;
  email: string; // Changed from username to email for consistency
  isAdmin?: boolean;
}

/**
 * Represents a user document from the database.
 */
export interface User {
  _id: string;
  email: string;
  password?: string;
  createdAt: Date;
  isAdmin?: boolean;
  preferences?: QuizPrefs;
  viewHistory?: string[]; // Array of Item _id strings
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
  isActive: boolean;
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
  cvMimeType: string;
  cvBase64: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  createdAt: Date;
}