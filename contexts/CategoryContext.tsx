"use client";

import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { 
  addCategory as addCatServer, 
  updateCategory as updateCatServer, 
  deleteCategory as deleteCatServer 
} from "@/actions/category";

export interface Category {
  id: string;
  name: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface CategoryContextValue {
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children, initialCategories }: { children: ReactNode, initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Sync when server data changes via revalidatePath
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  async function addCategory(name: string, color: string) {
    const optimisticId = Date.now().toString();
    setCategories((prev) => [...prev, { id: optimisticId, name, color }]);
    
    const res = await addCatServer(name, color);
    if (!res.success) {
      alert(res.error);
      setCategories((prev) => prev.filter((c) => c.id !== optimisticId)); // Revert
    } else if (res.data) {
      // Swap optimistic ID with real DB ID
      setCategories((prev) => prev.map((c) => c.id === optimisticId ? res.data as Category : c));
    }
  }

  async function updateCategory(id: string, name: string, color: string) {
    const previous = [...categories];
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, color } : c)));

    const res = await updateCatServer(id, name, color);
    if (!res.success) {
      alert(res.error);
      setCategories(previous); // Revert
    }
  }

  async function deleteCategory(id: string) {
    const previous = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== id));

    const res = await deleteCatServer(id);
    if (!res.success) {
      alert(res.error);
      setCategories(previous); // Revert
    }
  }

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used inside CategoryProvider");
  return ctx;
}
