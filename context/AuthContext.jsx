// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create authentication context
const AuthContext = createContext();

// Provide authentication state to the app
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await handleUserSession(session.user, session);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id, 'Session exists:', !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processing SIGNED_IN event with session user');
          await handleUserSession(session.user, session);
        } else if (event === 'SIGNED_OUT') {
          console.log('Processing SIGNED_OUT event');
          await handleSignOut();
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('Processing USER_UPDATED event');
          await handleUserSession(session.user, session);
        } else {
          console.log('Event not handled:', event, 'Session user:', !!session?.user);
        }
      });

      setLoading(false);
      return () => subscription?.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const handleUserSession = async (user, session = null) => {
    try {
      if (!user || !user.id) {
        console.error('Invalid user object received:', user);
        return;
      }
      
      console.log('Handling user session for:', user.id, 'Access token:', user.access_token ? 'exists' : 'missing');
      
      // Fetch user profile from user_tbl
      const { data: profile, error } = await supabase
        .from('user_tbl')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create a basic one
        setUserProfile({
          id: user.id,
          user_email: user.email,
          user_firstname: user.user_metadata?.user_firstname || '',
          user_lastname: user.user_metadata?.user_lastname || '',
        });
      } else {
        setUserProfile(profile);
      }

      // Store auth data in AsyncStorage - only if values exist
      try {
        // Try to get access token from session first, then from user
        const accessToken = session?.access_token || user.access_token;
        if (accessToken) {
          await AsyncStorage.setItem('userToken', accessToken);
        } else {
          console.log('No access token available, skipping token storage');
        }
        await AsyncStorage.setItem('userData', JSON.stringify(profile || {}));
        await AsyncStorage.setItem('isAuthenticated', 'true');
      } catch (storageError) {
        console.error('Error storing data in AsyncStorage:', storageError);
      }

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('isAuthenticated');

      // Clear state
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // User authentication methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        console.log('Sign in successful, user data:', {
          id: data.user.id,
          email: data.user.email,
          hasAccessToken: !!data.user.access_token,
          hasSession: !!data.session
        });
        
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          throw new Error('Please verify your email address before signing in.');
        }

        // Use session.user if available, otherwise use data.user
        const userToProcess = data.session?.user || data.user;
        await handleUserSession(userToProcess, data.session);
        return { success: true, user: userToProcess };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      // Validate required fields
      if (!userData.user_firstname || !userData.user_lastname || !userData.user_mobile || 
          !userData.user_bday || !userData.user_email || !userData.password) {
        throw new Error('Please fill in all required fields.');
      }

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.user_email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Password validation
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      // Check if password contains at least one uppercase, one lowercase, and one number
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(userData.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      }

      // Mobile number validation
      if (!/^\d+$/.test(userData.user_mobile)) {
        throw new Error('Mobile number must contain only numbers.');
      }
      if (!userData.user_mobile.startsWith('09') || userData.user_mobile.length !== 11) {
        throw new Error('Mobile number must be 11 digits long and start with 09.');
      }

      // Age validation
      const today = new Date();
      const birthDate = new Date(userData.user_bday);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
        throw new Error('You must be at least 18 years old to register.');
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.user_email,
        password: userData.password,
        options: {
          data: {
            user_firstname: userData.user_firstname,
            user_lastname: userData.user_lastname,
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Store additional user data in the user_tbl
        const { error: profileError } = await supabase
          .from('user_tbl')
          .insert([{
            id: authData.user.id,
            user_firstname: userData.user_firstname,
            user_middle: userData.user_middle || '',
            user_lastname: userData.user_lastname,
            user_gender: userData.user_gender || 'rather not to tell',
            user_status: userData.user_status || '-',
            user_mobile: userData.user_mobile,
            user_bday: userData.user_bday.toISOString().split('T')[0],
            user_email: userData.user_email,
          }]);

        if (profileError) throw profileError;

        return { 
          success: true, 
          user: authData.user,
          message: 'Account created successfully! Please check your email to verify your account.'
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await handleSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_tbl')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile(prev => ({ ...prev, ...profileData }));
      await AsyncStorage.setItem('userData', JSON.stringify({ ...userProfile, ...profileData }));

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sagradago://reset-password',
      });

      if (error) throw error;
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    // State
    isAuthenticated,
    user,
    userProfile,
    loading,
    
    // User methods
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication state
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
