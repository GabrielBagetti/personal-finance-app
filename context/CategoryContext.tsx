import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth, API_URL } from './AuthContext';


export interface Category {
  id: number;
  name: string;
  type: 'receita' | 'despesa';
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string, type: 'receita' | 'despesa') => Promise<boolean>;
  updateCategory: (id: number, newName: string) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  isLoading: boolean;
}
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!session) {
        setCategories([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${session}` }
        });
        const data = await response.json();
        setCategories(data);
      } catch (e) {
        console.error("Falha ao carregar categorias", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [session]);

  const addCategory = async (name: string, type: 'receita' | 'despesa'): Promise<boolean> => {
    if (!session) return false;
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session}` },
      body: JSON.stringify({ name, type })
    });
    if (response.ok) {
      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
      return true;
    } else {
        const error = await response.json();
        alert(error.error);
        return false;
    }
  };
  
  const updateCategory = async (id: number, newName: string): Promise<boolean> => {
      if (!session) return false;
      const response = await fetch(`${API_URL}/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session}` },
          body: JSON.stringify({ name: newName })
      });
      if(response.ok) {
          const updatedCategory = await response.json();
          setCategories(prev => prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
          return true;
      } else {
          const error = await response.json();
          alert(error.error);
          return false;
      }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
  if (!session) return false;
  try {
    console.log(`[CONTEXT] Tentando deletar categoria com ID: ${id}`);
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session}` },
    });

    if (response.ok) {
      console.log(`[CONTEXT] Categoria ${id} deletada com sucesso.`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } else {
      const error = await response.json().catch(() => null);
      console.error(`[CONTEXT] Falha ao deletar categoria ${id}`, error);
      return false;
    }
  } catch (e) {
    console.error(`[CONTEXT] Erro inesperado ao deletar categoria ${id}`, e);
    return false;
  }
};


  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, isLoading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};