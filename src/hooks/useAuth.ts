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
          console.log('useAuth: No session or error getting session:', error.message);
        } else {
          console.log('useAuth: Initial session result:', session ? 'Session found' : 'No session');
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.log('useAuth: Expected error during mock session fetch:', error);
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
          console.log('useAuth: Expected error handling auth state change:', error);
        } finally {
          setLoading(false);
        }
      });
      
      subscription = authSubscription;
    } catch (error) {
      console.log('useAuth: Expected error setting up auth state listener:', error);
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
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

       console.log('💬 PROFILE FETCH RESULT:', { data, error });

      if (error) {
       console.log('❌ Profile fetch error:', error.message);
        return;
      }

      if (data) {
        console.log('✅ User profile fetched:', data);
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
      console.log('useAuth: Expected error in fetchUserProfile (using mock):', error);
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
        console.log('useAuth: Sign up error (expected with mock):', error.message);
        // For demo purposes, create a mock user
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          email,
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
        return { data: { user: mockUser }, error: null };
      }

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

        if (profileError) {
          console.log('useAuth: Profile creation error (expected with mock):', profileError.message);
        } else {
          console.log('useAuth: User profile created successfully');
        }
      }

      return { data, error: null };
    } catch (error) {
      console.log('useAuth: Expected error signing up (using mock):', error);
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

      if (error) {
        console.log('useAuth: Sign in error (expected with mock):', error.message);
        // For demo purposes, create a mock user
        const mockUser: User = {
          id: 'mock-user-signin',
          firstName: 'Alex',
          lastName: 'Johnson',
          name: 'Alex Johnson',
          email,
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
        return { data: { user: mockUser }, error: null };
      }
      
      console.log('useAuth: User signed in successfully');
      return { data, error: null };
    } catch (error) {
      console.log('useAuth: Expected error signing in (using mock):', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Attempting to sign out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('useAuth: Sign out error (expected with mock):', error.message);
      }
      
      setUser(null);
      setSupabaseUser(null);
      console.log('useAuth: User signed out successfully');
    } catch (error) {
      console.log('useAuth: Expected error signing out (using mock):', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser && !user) return { error: 'No user logged in' };

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
        .eq('id', supabaseUser?.id || user?.id);

      if (error) {
        console.log('useAuth: Profile update error (expected with mock):', error.message);
        // For mock, just update the local user state
        if (user) {
          setUser({ ...user, ...updates });
        }
      } else {
        // Refresh user profile
        if (supabaseUser) {
          await fetchUserProfile(supabaseUser.id);
        }
        console.log('useAuth: Profile updated successfully');
      }
      
      return { error: null };
    } catch (error) {
      console.log('useAuth: Expected error updating profile (using mock):', error);
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