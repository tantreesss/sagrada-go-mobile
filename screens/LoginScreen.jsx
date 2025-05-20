import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../styles/globalStyles';

export default function LoginScreen({ navigation }) {
  const { setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Check if email is verified
        if (!authData.user.email_confirmed_at) {
          Alert.alert(
            'Email Not Verified',
            'Please verify your email before logging in.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await supabase.auth.signOut();
                  setIsAuthenticated(false);
                }
              }
            ]
          );
          return;
        }

        // 3. Get user profile data from user_tbl
        const { data: userData, error: userError } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;

        // 4. Check if user is an employee
        const { data: employeeData, error: employeeError } = await supabase
          .from('employee_tbl')
          .select('id, user_role')
          .eq('user_email', email)
          .single();

        if (employeeData) {
          // Store employee role in context or state management
          // You might want to add this to your AuthContext
          console.log('Employee role:', employeeData.user_role);
        }

        setIsAuthenticated(true);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Image source={require('../assets/sagrada.png')} style={styles.logo} />

      <Text style={globalStyles.title}>Login</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[globalStyles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Signup')}
        disabled={loading}
      >
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,  
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 20,  
    alignSelf: 'center', 
  },
  input: { 
    height: 50, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    marginBottom: 15 
  },
  link: { 
    color: '#AA722A', 
    marginTop: 10, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
