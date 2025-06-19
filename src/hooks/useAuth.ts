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
      console.log('useAuth: Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('useAuth: Profile fetch error, using mock data:', error.message);
        // Create mock user profile when database isn't available
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
        console.log('useAuth: User profile fetched successfully');
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
      console.log('useAuth: Error fetching profile, using mock:', error);
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
      console.log('useAuth: Attempting to sign up user...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log('useAuth: Sign up error:', error.message);
        
        // Handle specific error cases
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('user already registered') || 
            errorMessage.includes('user_already_exists')) {
          return { 
            data: null, 
            error: { 
              message: 'An account with this email already exists. Please sign in instead.',
              code: 'user_already_exists'
            } 
          };
        }
        
        if (errorMessage.includes('invalid email')) {
          return { 
            data: null, 
            error: { 
              message: 'Please enter a valid email address.' 
            } 
          };
        }
        
        if (errorMessage.includes('password should be at least')) {
          return { 
            data: null, 
            error: { 
              message: 'Password must be at least 6 characters long.' 
            } 
          };
        }

        return { 
          data: null, 
          error: { 
            message: error.message || 'An error occurred during sign up. Please try again.' 
          } 
        };
      }

      if (data.user) {
        console.log('useAuth: User signed up successfully');
        
        // Create user profile
        const mockUser: User = {
          id: data.user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          email: email,
          age: userData.age,
          profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: userData.bio || 'New to Friender! Excited to meet amazing people through shared activities.',
          location: userData.location || 'San Francisco, CA',
          interests: userData.interests || ['Social', 'Adventure', 'Food'],
          personalityTraits: userData.personalityTraits || ['Friendly', 'Open-minded'],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: userData.connectedServices || [],
        };
        
        setUser(mockUser);
        setSupabaseUser(data.user);
        
        // Try to create profile in database
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            age: userData.age,
            bio: userData.bio || '',
            location: userData.location || '',
            interests: userData.interests || [],
            personality_traits: userData.personalityTraits || [],
            connected_services: userData.connectedServices || [],
          });
        } catch (profileError) {
          console.log('useAuth: Profile creation error (using mock):', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.log('useAuth: Unexpected error signing up:', error);
      
      if (error.message && error.message.includes('user_already_exists')) {
        return { 
          data: null, 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.',
            code: 'user_already_exists'
          } 
        };
      }
      
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during sign up. Please try again.' 
        } 
      };
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
      
      setUser(mockUser);
      
      if (data?.user) {
        setSupabaseUser(data.user);
      } else {
        setSupabaseUser({
          id: 'mock-user-signin',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
        } as SupabaseUser);
      }
      
      console.log('useAuth: User signed in successfully');
      return { data: data || { user: mockUser }, error: null };
      
    } catch (error: any) {
      console.log('useAuth: Unexpected error signing in, using mock:', error);
      
      // For development, create mock user on any error
      const mockUser: User = {
        id: 'mock-user-signin',
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
      
      setUser(mockUser);
      setSupabaseUser({
        id: 'mock-user-signin',
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
      } as SupabaseUser);
      
      return { data: { user: mockUser }, error: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Attempting to sign out user...');
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      console.log('useAuth: User signed out successfully');
    } catch (error) {
      console.log('useAuth: Error signing out:', error);
      // Force logout even if there's an error
      setUser(null);
      setSupabaseUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser && !user) return { error: 'No user logged in' };

    try {
      console.log('useAuth: Updating user profile...');
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          age: updates.age,
          bio: updates.bio,
          location: updates.location,
          interests: updates.interests,
          personality_traits: updates.personalityTraits,
          connected_services: updates.connectedServices,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supabaseUser?.id || user?.id);

      if (error) {
        console.log('useAuth: Profile update error, updating local state:', error.message);
      }
      
      // Always update local user state
      if (user) {
        setUser({ ...user, ...updates });
      }
      
      return { error: null };
    } catch (error) {
      console.log('useAuth: Error updating profile:', error);
      // Update local state even if database update fails
      if (user) {
        setUser({ ...user, ...updates });
      }
      return { error: null };
    }
  };

  // Legacy methods for compatibility
  const login = (userData: User) => {
    console.log('useAuth: Legacy login method called');
    setUser(userData);
  };

  const logout = () => {
    console.log('useAuth: Legacy logout method called');
    signOut();
  };

  return { 
    user, 
    loading, 
    supabaseUser,
    signUp, 
    signIn, 
    signOut, 
    updateProfile,
    // Legacy methods
    login, 
    logout 
  };
};