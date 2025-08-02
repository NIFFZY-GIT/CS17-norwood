// src/lib/types.ts (Complete and Corrected)

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
  category: 'Snacks' | 'Bites' | 'Drinks' | string;
  tags: ('salty' | 'sweet' | 'spicy' | 'healthy' | 'morning' | 'afternoon' | 'night')[];
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
 * UPDATED: Represents the session data for a logged-in user.
 * The 'role' property is added to be used for role-based access control (e.g., in the dashboard layout).
 */
export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'user'; // This is more explicit and scalable than isAdmin
}

/**
 * Represents a user document from the database.
 */
export interface User {
  _id: string;
  username?: string;
  email: string;
  password?: string;
  createdAt: Date;
  isAdmin?: boolean; // This can remain for your database schema
  preferences?: QuizPrefs;
  viewHistory?: string[];
}

/**
 * ADDED: Represents a complete order object for the admin dashboard.
 * This includes all necessary shipping details for fulfillment.
 */
export interface AdminOrder {
  _id: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  shippingDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  customer: {
    email: string;
    username: string;
    id: string;
  };
}

// =================================================================
// CAREERS & RECRUITMENT TYPES (Unchanged)
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