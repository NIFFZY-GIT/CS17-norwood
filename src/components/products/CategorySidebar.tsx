"use client";
import React from "react";

export interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <aside className="w-56 hidden md:block">
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => onSelectCategory(category)}
              className={
                selectedCategory === category
                  ? "block w-full text-left px-4 py-2 rounded bg-amber-500 text-white"
                  : "block w-full text-left px-4 py-2 rounded text-gray-400 hover:bg-gray-700"
              }
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
