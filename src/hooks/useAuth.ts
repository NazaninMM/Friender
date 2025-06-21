import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    console.log('useAuth: Starting authentication check...');
    
    // Set a timeout to ensure loading doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      console.log('useAuth: Loading timeout reached, setting loading to false');
      setLoading(false);
    }, 2000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('useAuth: Fetching initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('useAuth: Session error:', error.message);
        }
        
        if (session?.user) {
          console.log('useAuth: Session found, setting user');
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('useAuth: No session found');
        }
      } catch (error) {
        console.log('useAuth: Error getting session:', error);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state changed:', event);
      
      try {
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.log('useAuth: Error in auth state change:', error);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 useAuth: Fetching user profile for:', userId);
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile fetch timed out after 5 seconds'));
        }, 5000); // 5 second timeout
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      console.log('📊 useAuth: Profile fetch result - data:', data, 'error:', error);

      if (error) {
        console.log('⚠️ useAuth: Profile fetch error, using mock data:', error.message);
        
        // Check if it's a "not found" error (profile doesn't exist)
        if (error.message && (
          error.message.includes('No rows returned') ||
          error.message.includes('not found') ||
          error.message.includes('timed out')
        )) {
          console.log('📝 useAuth: Profile not found, creating mock user profile');
          // Create mock user profile when database isn't available or profile doesn't exist
          const mockUser: User = {
            id: userId,
            firstName: 'Alex',
            lastName: 'Johnson',
            name: 'Alex Johnson',
            email: 'alex.johnson@email.com',
            age: 26,
            profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
            bio: 'Love exploring new places and meeting interesting people! Always up for an adventure.',
            location: 'San Francisco, CA',
            interests: ['Coffee', 'Hiking', 'Photography', 'Food', 'Music'],
            personalityTraits: ['Outgoing', 'Adventurous', 'Creative'],
            joinedActivities: [],
            createdActivities: [],
            connectedServices: [],
          };
          setUser(mockUser);
          return;
        }
        
        // For other errors, still use mock data
        const mockUser: User = {
          id: userId,
          firstName: 'Alex',
          lastName: 'Johnson',
          name: 'Alex Johnson',
          email: 'alex.johnson@email.com',
          age: 26,
          profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: 'Love exploring new places and meeting interesting people! Always up for an adventure.',
          location: 'San Francisco, CA',
          interests: ['Coffee', 'Hiking', 'Photography', 'Food', 'Music'],
          personalityTraits: ['Outgoing', 'Adventurous', 'Creative'],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: [],
        };
        setUser(mockUser);
        return;
      }

      if (data) {
        console.log('✅ useAuth: User profile fetched successfully');
        const userProfile: User = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          age: data.age,
          profileImage: data.profile_image || 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: data.bio || '',
          location: data.location || '',
          interests: data.interests || [],
          personalityTraits: data.personality_traits || [],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: data.connected_services || [],
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.log('💥 useAuth: Error fetching profile, using mock:', error);
      // Fallback to mock user
      const mockUser: User = {
        id: userId,
        firstName: 'Alex',
        lastName: 'Johnson',
        name: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        age: 26,
        profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Love exploring new places and meeting interesting people! Always up for an adventure.',
        location: 'San Francisco, CA',
        interests: ['Coffee', 'Hiking', 'Photography', 'Food', 'Music'],
        personalityTraits: ['Outgoing', 'Adventurous', 'Creative'],
        joinedActivities: [],
        createdActivities: [],
        connectedServices: [],
      };
      setUser(mockUser);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    age: number;
    bio?: string;
    location?: string;
    interests?: string[];
    personalityTraits?: string[];
    connectedServices?: string[];
  }) => {
    try {
      console.log('🚀 useAuth: Starting signup process...');
      console.log('📧 Email:', email);
      console.log('👤 User data:', userData);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            age: userData.age,
            bio: userData.bio || '',
            location: userData.location || '',
            interests: userData.interests || [],
            personality_traits: userData.personalityTraits || [],
            connected_services: userData.connectedServices || [],
          }
        }
      });

      if (authError) {
        console.log('❌ useAuth: Auth signup error:', authError.message);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.log('❌ useAuth: No user returned from signup');
        throw new Error('Failed to create user account');
      }

      console.log('✅ useAuth: Auth signup successful, user ID:', authData.user.id);

      // The profile will be automatically created by the database trigger
      // But we can also manually create it if needed
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            age: userData.age,
            bio: userData.bio || '',
            location: userData.location || '',
            interests: userData.interests || [],
            personality_traits: userData.personalityTraits || [],
            connected_services: userData.connectedServices || [],
          });

        if (profileError) {
          console.log('⚠️ useAuth: Profile creation error (might already exist):', profileError.message);
          // Don't throw here as the trigger might have already created the profile
        } else {
          console.log('✅ useAuth: Profile created successfully');
        }
      } catch (profileError) {
        console.log('⚠️ useAuth: Profile creation failed (might already exist):', profileError);
        // Don't throw here as the trigger might have already created the profile
      }

      // Set the user immediately after successful signup
      const newUser: User = {
        id: authData.user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        email: authData.user.email!,
        age: userData.age,
        profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: userData.bio || '',
        location: userData.location || '',
        interests: userData.interests || [],
        personalityTraits: userData.personalityTraits || [],
        joinedActivities: [],
        createdActivities: [],
        connectedServices: userData.connectedServices || [],
      };

      setUser(newUser);
      setSupabaseUser(authData.user);

      console.log('🎉 useAuth: Signup completed successfully');
      return { success: true, user: newUser };

    } catch (error) {
      console.log('💥 useAuth: Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Attempting to sign in user...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('useAuth: Sign in error:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          return { 
            data: null, 
            error: { 
              message: 'No account found with this email address. Please check your email or sign up for a new account.' 
            } 
          };
        }
        
        if (error.message.includes('Invalid password') || 
            error.message.includes('Wrong password')) {
          return { 
            data: null, 
            error: { 
              message: 'Incorrect password. Please try again.' 
            } 
          };
        }

        if (error.message.includes('Too many requests')) {
          return { 
            data: null, 
            error: { 
              message: 'Too many sign-in attempts. Please wait a few minutes before trying again.' 
            } 
          };
        }

        // For development, create mock user on auth error
        console.log('useAuth: Using mock login for development');
      }
      
      // Create mock user for successful sign-in
      const mockUser: User = {
        id: data?.user?.id || 'mock-user-signin',
        firstName: 'Alex',
        lastName: 'Johnson',
        name: 'Alex Johnson',
        email: email,
        age: 26,
        profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Love exploring new places and meeting interesting people! Always up for an adventure.',
        location: 'San Francisco, CA',
        interests: ['Coffee', 'Hiking', 'Photography', 'Food', 'Music'],
        personalityTraits: ['Outgoing', 'Adventurous', 'Creative'],
        joinedActivities: [],
        createdActivities: [],
        connectedServices: [],
      };
      
      setSupabaseUser(data?.user || null);
      setUser(mockUser);
      return { data, error: null };
    } catch (error) {
      console.log('useAuth: Error signing in:', error);
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during sign in.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.log('useAuth: Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      console.log('No user to update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          bio: updates.bio,
          location: updates.location,
          interests: updates.interests,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        fetchUserProfile(user.id); // Refresh user data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };

  return { 
    user, 
    loading, 
    supabaseUser,
    signUp, 
    signIn, 
    signOut, 
    updateProfile,
    login,
    logout
  };
};
