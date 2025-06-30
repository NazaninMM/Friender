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
        console.log('⚠️ useAuth: Profile fetch error:', error.message);
        
        // Check if it's a "not found" error (profile doesn't exist)
        if (error.message && (
          error.message.includes('No rows returned') ||
          error.message.includes('not found') ||
          error.message.includes('timed out')
        )) {
          console.log('📝 useAuth: Profile not found');
          setUser(null);
          return;
        }
        
        // For other errors, also return null
        console.log('❌ useAuth: Profile fetch failed');
        setUser(null);
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
          profileImage: data.profile_image || '',
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
      console.log('💥 useAuth: Error fetching profile:', error);
      setUser(null);
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

      // Prepare metadata for the signup
      const signupMetadata = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        age: userData.age,
        bio: userData.bio || '',
        location: userData.location || '',
        interests: userData.interests || [],
        personality_traits: userData.personalityTraits || [],
        connected_services: userData.connectedServices || [],
      };

      console.log('📋 useAuth: Signup metadata:', signupMetadata);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: signupMetadata
        }
      });

      if (authError) {
        console.log('❌ useAuth: Auth signup error:', authError.message);
        console.log('🔍 useAuth: Full auth error:', authError);
        
        // Provide more specific error messages
        if (authError.message.includes('Database error saving new user')) {
          throw new Error('There was an issue creating your profile. Please try again or contact support if the problem persists.');
        } else if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (authError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (authError.message.includes('Password')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(authError.message);
        }
      }

      if (!authData.user) {
        console.log('❌ useAuth: No user returned from signup');
        throw new Error('Failed to create user account');
      }

      console.log('✅ useAuth: Auth signup successful, user ID:', authData.user.id);

      // Wait a moment for the trigger to create the profile
      console.log('⏳ useAuth: Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to fetch the created profile
      try {
        await fetchUserProfile(authData.user.id);
        console.log('✅ useAuth: Profile fetched after signup');
      } catch (profileError) {
        console.log('⚠️ useAuth: Could not fetch profile immediately after signup:', profileError);
        // Don't throw here, the profile might be created by the trigger
      }

      // Set the user immediately after successful signup
      const newUser: User = {
        id: authData.user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        email: authData.user.email!,
        age: userData.age,
        profileImage: '', // No default image, user can upload their own
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
      return { success: true, user: newUser, isNewUser: true };

    } catch (error) {
      console.log('💥 useAuth: Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('useAuth: Sign in error:', error.message);
        return { data: null, error, isNewUser: false };
      }

      if (data?.user) {
        console.log('useAuth: Sign in successful');
        setSupabaseUser(data.user);
        // User profile will be fetched in the useEffect above
        return { data, error: null, isNewUser: false };
      }

      return { data: null, error: { message: 'Sign in failed' }, isNewUser: false };
    } catch (error) {
      console.log('useAuth: Error signing in:', error);
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during sign in.' 
        },
        isNewUser: false
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
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.interests) updateData.interests = updates.interests;
      if (updates.personalityTraits) updateData.personality_traits = updates.personalityTraits;
      if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
      if (updates.connectedServices) updateData.connected_services = updates.connectedServices;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Update the user state immediately with the new data
        const updatedUser: User = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          age: data.age,
          profileImage: data.profile_image || '',
          bio: data.bio || '',
          location: data.location || '',
          interests: data.interests || [],
          personalityTraits: data.personality_traits || [],
          joinedActivities: data.joined_activities || [],
          createdActivities: data.created_activities || [],
          connectedServices: data.connected_services || [],
        };
        
        setUser(updatedUser);
        console.log('✅ Profile updated successfully:', updatedUser);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
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