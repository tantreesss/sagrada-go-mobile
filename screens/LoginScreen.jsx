import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase, handleSupabaseError } from '../lib/supabase';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
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

        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        setIsAuthenticated(true);
        navigation.navigate('Home');
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      Alert.alert('Error', errorMessage);
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
        <Text style={globalStyles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
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
