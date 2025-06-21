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
  
  // Create a comprehensive mock client with realistic error handling
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
        console.log('🔐 Mock: signUp called with:', credentials.email);
        console.log('⏱️ Mock: Starting signup simulation...');
        
        // Simulate some validation
        if (!credentials.email || !credentials.password) {
          console.log('❌ Mock: Missing email or password');
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Email and password are required' } 
          });
        }
        
        if (credentials.password.length < 6) {
          console.log('❌ Mock: Password too short');
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Password must be at least 6 characters long' } 
          });
        }
        
        console.log('✅ Mock: Validation passed, creating mock user...');
        
        // Simulate a delay
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log('🎉 Mock: Signup completed, returning mock user');
            resolve({ 
              data: { 
                user: { 
                  id: 'mock-user-' + Date.now(), 
                  email: credentials.email 
                } 
              }, 
              error: null 
            });
          }, 1000); // 1 second delay to simulate network request
        });
      },
      signInWithPassword: (credentials: any) => {
        console.log('Mock: signInWithPassword called with:', credentials.email);
        
        // Simulate realistic authentication errors
        const mockUsers = [
          'alex.johnson@email.com',
          'maya.chen@email.com',
          'jordan.kim@email.com',
          'sam.rodriguez@email.com',
          'demo@friender.com',
          'test@example.com'
        ];
        
        if (!credentials.email || !credentials.password) {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Email and password are required' } 
          });
        }
        
        // Check if email exists in our mock database
        if (!mockUsers.includes(credentials.email.toLowerCase())) {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Invalid login credentials' } 
          });
        }
        
        // Simulate wrong password
        if (credentials.password === 'wrongpassword') {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Invalid login credentials' } 
          });
        }
        
        // Successful login
        return Promise.resolve({ 
          data: { 
            user: { 
              id: 'mock-user-signin', 
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
          console.log('💾 Mock: insert called with table data:', data);
          console.log('⏱️ Mock: Starting insert simulation...');
          
          // Simulate a delay for database operations
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('✅ Mock: Insert completed, returning error (mock mode)');
              resolve({ 
                error: { message: 'Supabase not configured - using mock data' } 
              });
            }, 500); // 0.5 second delay to simulate database operation
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
    console.log('🔧 Creating real Supabase client...');
    console.log('🌐 URL:', supabaseUrl);
    console.log('🔑 Anon Key length:', supabaseAnonKey?.length || 0);
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');
    
    // Test the connection
    console.log('🔍 Testing Supabase connection...');
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test successful');
      }
    }).catch(err => {
      console.log('💥 Supabase connection test exception:', err);
    });
    
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    // Fallback to mock client if creation fails
    supabase = mockClient;
  }
}

export { supabase };

// Add a global test function for debugging
if (typeof window !== 'undefined') {
  (window as any).testSupabase = async () => {
    console.log('🧪 Testing Supabase connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('📊 Test result:', { data, error });
      return { data, error };
    } catch (err) {
      console.log('💥 Test error:', err);
      return { data: null, error: err };
    }
  };
  
  (window as any).testSupabaseSignup = async (email: string, password: string) => {
    console.log('🧪 Testing Supabase signup...');
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log('📊 Signup test result:', { data, error });
      return { data, error };
    } catch (err) {
      console.log('💥 Signup test error:', err);
      return { data: null, error: err };
    }
  };
  
  (window as any).testProfilesTable = async () => {
    console.log('🧪 Testing profiles table...');
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      console.log('📊 Profiles table test result:', { data, error });
      return { data, error };
    } catch (err) {
      console.log('💥 Profiles table test error:', err);
      return { data: null, error: err };
    }
  };
  
  (window as any).testInsertProfile = async () => {
    console.log('🧪 Testing profile insert...');
    try {
      const testProfile = {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        age: 25,
        bio: 'Test user',
        location: 'Test City',
        interests: ['test'],
        personality_traits: ['test'],
        connected_services: []
      };
      const { data, error } = await supabase.from('profiles').insert(testProfile);
      console.log('📊 Profile insert test result:', { data, error });
      return { data, error };
    } catch (err) {
      console.log('💥 Profile insert test error:', err);
      return { data: null, error: err };
    }
  };
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          name: string
          age: number
          bio: string | null
          location: string | null
          profile_image: string | null
          interests: string[]
          personality_traits: string[]
          connected_services: string[]
          joined_activities: string[]
          created_activities: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          name?: string
          age: number
          bio?: string | null
          location?: string | null
          profile_image?: string | null
          interests?: string[]
          personality_traits?: string[]
          connected_services?: string[]
          joined_activities?: string[]
          created_activities?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          name?: string
          age?: number
          bio?: string | null
          location?: string | null
          profile_image?: string | null
          interests?: string[]
          personality_traits?: string[]
          connected_services?: string[]
          joined_activities?: string[]
          created_activities?: string[]
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
      direct_messages: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          activity_context: any
          last_message_time: string
          created_at: string
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          activity_context?: any
          last_message_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          activity_context?: any
          last_message_time?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          message_text: string
          message_type: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          message_text: string
          message_type: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          message_text?: string
          message_type?: string
          metadata?: any
          created_at?: string
        }
      }
      user_spotify_tracks: {
        Row: {
          id: string
          user_id: string
          spotify_id: string
          name: string
          artist_names: string[]
          album_name: string
          popularity: number | null
          audio_features: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spotify_id: string
          name: string
          artist_names: string[]
          album_name: string
          popularity?: number | null
          audio_features?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spotify_id?: string
          name?: string
          artist_names?: string[]
          album_name?: string
          popularity?: number | null
          audio_features?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_spotify_artists: {
        Row: {
          id: string
          user_id: string
          spotify_id: string
          name: string
          genres: string[]
          popularity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spotify_id: string
          name: string
          genres: string[]
          popularity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spotify_id?: string
          name?: string
          genres?: string[]
          popularity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_music_analysis: {
        Row: {
          id: string
          user_id: string
          top_genres: string[]
          music_personality: string[]
          audio_features_summary: any
          mood_analysis: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          top_genres?: string[]
          music_personality?: string[]
          audio_features_summary?: any
          mood_analysis?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          top_genres?: string[]
          music_personality?: string[]
          audio_features_summary?: any
          mood_analysis?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

console.log('🔍 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔍 VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);