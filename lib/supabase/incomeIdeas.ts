import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IncomeIdeaCategory = 'fast' | 'local' | 'digital' | 'weekend' | 'resell' | 'sell' | 'weekly' | 'rent' | 'home' | 'teach' | 'transport' | 'homebiz';
export type IncomeIdeaDifficulty = 'easy' | 'moderate';

export interface IncomeIdea {
  id: string;
  title: string;
  description: string;
  category: IncomeIdeaCategory;
  difficulty: IncomeIdeaDifficulty;
  is_active: boolean;
  created_at: string;
}

/**
 * Get all active income ideas, optionally filtered by category
 */
export async function getIncomeIdeas(category?: IncomeIdeaCategory): Promise<IncomeIdea[]> {
  try {
    let query = supabase
      .from('income_ideas')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching income ideas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching income ideas:', error);
    return [];
  }
}

/**
 * Get all income ideas (for admin - includes inactive)
 */
export async function getAllIncomeIdeas(): Promise<IncomeIdea[]> {
  try {
    const { data, error } = await supabase
      .from('income_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all income ideas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all income ideas:', error);
    return [];
  }
}

/**
 * Create a new income idea (admin only)
 */
export async function createIncomeIdea(idea: Omit<IncomeIdea, 'id' | 'created_at'>): Promise<IncomeIdea | null> {
  try {
    const { data, error } = await supabase
      .from('income_ideas')
      .insert([idea])
      .select()
      .single();

    if (error) {
      console.error('Error creating income idea:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating income idea:', error);
    return null;
  }
}

/**
 * Update an income idea (admin only)
 */
export async function updateIncomeIdea(id: string, updates: Partial<IncomeIdea>): Promise<IncomeIdea | null> {
  try {
    const { data, error } = await supabase
      .from('income_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating income idea:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating income idea:', error);
    return null;
  }
}

/**
 * Delete an income idea (admin only)
 */
export async function deleteIncomeIdea(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('income_ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income idea:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting income idea:', error);
    return false;
  }
}

/**
 * Toggle active status of an income idea (admin only)
 */
export async function toggleIncomeIdeaActive(id: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('income_ideas')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling income idea active status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error toggling income idea active status:', error);
    return false;
  }
}

