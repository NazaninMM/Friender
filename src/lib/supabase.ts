import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

let supabase: any;

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

if (!hasValidSupabaseConfig) {
  console.warn('⚠️ Supabase not configured properly - using mock client');
  console.log('To use real Supabase, update your .env file with valid credentials');
  
  // Create a comprehensive mock client
  const mockClient = {
    auth: {
      getSession: () => {
        console.log('Mock: getSession called');
        return Promise.resolve({ data: { session: null }, error: null });
      },
      onAuthStateChange: (callback: any) => {
        console.log('Mock: onAuthStateChange called');
        // Simulate no user initially
        setTimeout(() => callback('SIGNED_OUT', null), 100);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => console.log('Mock: Auth subscription unsubscribed') 
            } 
          } 
        };
      },
      signUp: (credentials: any) => {
        console.log('Mock: signUp called with:', credentials.email);
        return Promise.resolve({ 
          data: { 
            user: { 
              id: 'mock-user-id', 
              email: credentials.email 
            } 
          }, 
          error: null 
        });
      },
      signInWithPassword: (credentials: any) => {
        console.log('Mock: signInWithPassword called with:', credentials.email);
        return Promise.resolve({ 
          data: { 
            user: { 
              id: 'mock-user-id', 
              email: credentials.email 
            } 
          }, 
          error: null 
        });
      },
      signOut: () => {
        console.log('Mock: signOut called');
        return Promise.resolve({ error: null });
      }
    },
    from: (table: string) => {
      console.log('Mock: from called with table:', table);
      return {
        select: (columns: string) => {
          console.log('Mock: select called with columns:', columns);
          return {
            eq: (column: string, value: any) => {
              console.log('Mock: eq called with:', column, value);
              return {
                single: () => {
                  console.log('Mock: single called');
                  return Promise.resolve({ 
                    data: null, 
                    error: { message: 'Supabase not configured - using mock data' } 
                  });
                }
              };
            }
          };
        },
        insert: (data: any) => {
          console.log('Mock: insert called with:', data);
          return Promise.resolve({ 
            error: { message: 'Supabase not configured - using mock data' } 
          });
        },
        update: (data: any) => {
          console.log('Mock: update called with:', data);
          return {
            eq: (column: string, value: any) => {
              console.log('Mock: update eq called with:', column, value);
              return Promise.resolve({ 
                error: { message: 'Supabase not configured - using mock data' } 
              });
            }
          };
        }
      };
    }
  };
  
  supabase = mockClient;
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    // Fallback to mock client if creation fails
    supabase = mockClient;
  }
}

export { supabase };

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