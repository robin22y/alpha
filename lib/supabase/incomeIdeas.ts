import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

// --- safe helper ---
function check() {
  if (!supabase) {
    console.warn("Supabase not initialized (missing env vars)");
  }
  return supabase;
}

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

// GET ACTIVE ONLY
export async function getIncomeIdeas(category?: IncomeIdeaCategory): Promise<IncomeIdea[]> {
  const client = check();
  if (!client) return [];

  let query = client
    .from("income_ideas")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return data ?? [];
}

// GET ALL (ADMIN)
export async function getAllIncomeIdeas(): Promise<IncomeIdea[]> {
  const client = check();
  if (!client) return [];

  const { data } = await client
    .from("income_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

// CREATE
export async function createIncomeIdea(payload: Omit<IncomeIdea, 'id' | 'created_at'>): Promise<{ success: boolean; data?: IncomeIdea }> {
  const client = check();
  if (!client) return { success: false };

  const { data, error } = await client
    .from("income_ideas")
    .insert([payload])
    .select()
    .single();

  return { success: !error, data: data ?? undefined };
}

// UPDATE
export async function updateIncomeIdea(id: string, payload: Partial<IncomeIdea>): Promise<{ success: boolean; data?: IncomeIdea }> {
  const client = check();
  if (!client) return { success: false };

  const { data, error } = await client
    .from("income_ideas")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { success: !error, data: data ?? undefined };
}

// TOGGLE ACTIVE
export async function toggleIncomeIdeaActive(id: string, active: boolean): Promise<{ success: boolean }> {
  const client = check();
  if (!client) return { success: false };

  const { error } = await client
    .from("income_ideas")
    .update({ is_active: active })
    .eq("id", id);

  return { success: !error };
}

// DELETE
export async function deleteIncomeIdea(id: string): Promise<{ success: boolean }> {
  const client = check();
  if (!client) return { success: false };

  const { error } = await client
    .from("income_ideas")
    .delete()
    .eq("id", id);

  return { success: !error };
}
