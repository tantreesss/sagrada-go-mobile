// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth Context
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated } = useAuth(); // ✅ Get authentication state

  if (isAuthenticated === undefined) return null; // ✅ Prevent rendering errors

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
