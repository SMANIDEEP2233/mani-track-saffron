import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { User } from '@supabase/supabase-js';

export interface Expense {
  id: string;
  user_id: string;
  store_name: string;
  amount: number;
  date: string;
  category?: string;
  items?: string[];
  split_with?: number;
  user_portion?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchExpenses();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchExpenses();
      } else {
        setExpenses([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: {
    storeName: string;
    amount: number;
    date: string;
    category?: string;
    items?: string[];
    splitWith?: number;
    userPortion?: number;
    currency: string;
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add expenses',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          store_name: expenseData.storeName,
          amount: expenseData.amount,
          date: expenseData.date,
          category: expenseData.category,
          items: expenseData.items,
          split_with: expenseData.splitWith,
          user_portion: expenseData.userPortion,
          currency: expenseData.currency,
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [data, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });

      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          store_name: updates.store_name,
          amount: updates.amount,
          date: updates.date,
          category: updates.category,
          items: updates.items,
          split_with: updates.split_with,
          user_portion: updates.user_portion,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? data : expense
        )
      );

      toast({
        title: 'Success',
        description: 'Expense updated successfully',
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to update expense',
        variant: 'destructive',
      });
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  return {
    expenses,
    loading,
    user,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: fetchExpenses,
  };
}