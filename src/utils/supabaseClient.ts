import { createClient } from '@supabase/supabase-js';

// These should be in .env file in a real production app
// For this local/demo setup, we'll ask user to input them or hardcode them after they create the project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types Helper
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: number
          name: string
          created_at: string
          tournament_id: string | null
        }
        Insert: {
          id?: number // auto increment
          name: string
          created_at?: string
          tournament_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          tournament_id?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          group_name: string
          team_a_id: number
          team_b_id: number
          score: Json | null // Storing the score object { set1: {a,b}, ... }
          winner_id: number | null
          tournament_id: string | null
          created_at: string
          phase: number // 2=Group, 3=Ranking, 4=Knockout
        }
        Insert: {
          id?: string // uuid usually, or string
          group_name: string
          team_a_id: number
          team_b_id: number
          score?: Json | null
          winner_id?: number | null
          tournament_id?: string | null
          created_at?: string
          phase: number
        }
        Update: {
          id?: string
          group_name?: string
          team_a_id?: number
          team_b_id?: number
          score?: Json | null
          winner_id?: number | null
          tournament_id?: string | null
          created_at?: string
          phase?: number
        }
      }
      settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
      }
    }
  }
}

