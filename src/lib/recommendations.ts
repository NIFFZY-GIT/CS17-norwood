// src/lib/recommendations.ts

import { Item, User } from "./types";

// --- Scoring Weights ---
// These values determine the importance of each matching attribute.
// Adjust them to fine-tune your recommendations.
const WEIGHTS = {
  CATEGORY_MATCH: 10,       // Strong match for quiz category (Snacks/Bites)
  TIME_TAG_MATCH: 8,        // Match for quiz time (morning/afternoon/night)
  VIEW_HISTORY_MATCH: 5,    // Bonus for items in the same category as previously viewed items
  BASE_SCORE: 1,            // Every item gets a small base score
};

/**
 * The main recommendation function.
 * It takes a user and a list of all available products,
 * and returns a sorted list of recommended products.
 *
 * @param user The user object, including preferences and view history.
 * @param allItems An array of all products available in the store.
 * @returns A new array of items, sorted by recommendation score.
 */
export function getRecommendedItems(user: User | null, allItems: Item[]): Item[] {
  // If no user or no items, return the original list unshuffled.
  if (!user || !allItems || allItems.length === 0) {
    return allItems;
  }

  const { preferences, viewHistory = [] } = user;

  // Create a Set of viewed item categories for quick lookup
  const viewedCategories = new Set<string>();
  if (viewHistory.length > 0) {
    const viewedItems = allItems.filter(item => viewHistory.includes(item._id));
    viewedItems.forEach(item => viewedCategories.add(item.category));
  }

  const scoredItems = allItems.map(item => {
    let score = WEIGHTS.BASE_SCORE;

    // 1. Score based on quiz preferences
    if (preferences) {
      // Match item category with quiz preference (e.g., 'Snacks' vs 'Snacks')
      if (preferences.category && item.category === preferences.category) {
        score += WEIGHTS.CATEGORY_MATCH;
      }

      // Match item tags with quiz time preference (e.g., 'morning' tag vs 'Morning' preference)
      const timePref = preferences.time?.toLowerCase();
      if (
        timePref &&
        timePref !== 'anytime' &&
        item.tags.includes(timePref as typeof item.tags[number])
      ) {
        score += WEIGHTS.TIME_TAG_MATCH;
      }
    }

    // 2. Score based on view history
    // If the item's category is one the user has viewed before, give it a boost.
    if (viewedCategories.has(item.category)) {
        score += WEIGHTS.VIEW_HISTORY_MATCH;
    }

    // Return the item with its calculated score
    return { ...item, recommendationScore: score };
  });

  // Sort items in descending order of their score
  scoredItems.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredItems;
}