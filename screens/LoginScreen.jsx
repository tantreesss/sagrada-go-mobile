import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';

export default function LoginScreen({ navigation }) {
  const { setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem(email);
      if (!userData) {
        Alert.alert('Error', 'User not found.');
        return;
      }
  
      const user = JSON.parse(userData);
  
      if (user.password === password) {
        setIsAuthenticated(true);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Incorrect password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
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
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
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
});
