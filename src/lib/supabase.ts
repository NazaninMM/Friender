import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  
  // Create a mock client to prevent app crashes
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
    })
  }
  
  // Export mock client
  export const supabase = mockClient as any
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          age: number
          bio: string | null
          location: string | null
          profile_image: string | null
          interests: string[]
          personality_traits: string[]
          connected_services: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          age: number
          bio?: string | null
          location?: string | null
          profile_image?: string | null
          interests?: string[]
          personality_traits?: string[]
          connected_services?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          age?: number
          bio?: string | null
          location?: string | null
          profile_image?: string | null
          interests?: string[]
          personality_traits?: string[]
          connected_services?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          date: string
          time: string
          max_attendees: number
          current_attendees: number
          category: string
          tags: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          date: string
          time: string
          max_attendees: number
          current_attendees?: number
          category: string
          tags?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          date?: string
          time?: string
          max_attendees?: number
          current_attendees?: number
          category?: string
          tags?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_attendees: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          status?: string
          joined_at?: string
        }
      }
      join_requests: {
        Row: {
          id: string
          activity_id: string
          requester_id: string
          message: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          requester_id: string
          message: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          requester_id?: string
          message?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}