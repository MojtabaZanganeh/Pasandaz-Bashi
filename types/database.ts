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
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      savings: {
        Row: {
          id: string
          user_id: string
          amount: number
          hours: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          hours: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          hours?: number
          month?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for database operations
export type UserRow = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type SavingRow = Database['public']['Tables']['savings']['Row']
export type SavingInsert = Database['public']['Tables']['savings']['Insert']
export type SavingUpdate = Database['public']['Tables']['savings']['Update']
