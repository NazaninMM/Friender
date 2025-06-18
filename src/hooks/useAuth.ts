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
    
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        console.log('useAuth: Fetching initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          return;
        }
        
        console.log('useAuth: Initial session result:', session ? 'Session found' : 'No session');
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Unexpected error during initial session fetch:', error);
      } finally {
        console.log('useAuth: Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with error handling
    let subscription;
    try {
      console.log('useAuth: Setting up auth state listener...');
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('useAuth: Auth state changed:', event, session ? 'Session present' : 'No session');
          if (session?.user) {
            setSupabaseUser(session.user);
            await fetchUserProfile(session.user.id);
          } else {
            setSupabaseUser(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        } finally {
          setLoading(false);
        }
      });
      
      subscription = authSubscription;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('useAuth: Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
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
      console.error('Error in fetchUserProfile:', error);
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

      if (error) throw error;

      if (data.user) {
        console.log('useAuth: User signed up successfully, creating profile...');
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
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

        if (profileError) throw profileError;
        console.log('useAuth: User profile created successfully');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Attempting to sign in user...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('useAuth: User signed in successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Attempting to sign out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSupabaseUser(null);
      console.log('useAuth: User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser) return { error: 'No user logged in' };

    try {
      console.log('useAuth: Updating user profile...');
      const { error } = await supabase
        .from('users')
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
        .eq('id', supabaseUser.id);

      if (error) throw error;

      // Refresh user profile
      await fetchUserProfile(supabaseUser.id);
      console.log('useAuth: Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
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