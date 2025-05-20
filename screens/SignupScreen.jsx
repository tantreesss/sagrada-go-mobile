import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../styles/globalStyles';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { setIsAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!firstName || !lastName || !contactNumber || !birthday || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {  
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }

    if (!/^\d+$/.test(contactNumber)) {
      Alert.alert('Error', 'Contact number must contain only numbers.');
      return false;
    }

    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
      Alert.alert('Error', 'You must be at least 18 years old to register.');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Store additional user data in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              contact_number: contactNumber,
              birthday: birthday.toISOString().split('T')[0],
              email: email,
            },
          ]);

        if (profileError) throw profileError;

        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email for verification.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Sign out the user since they need to verify their email
                supabase.auth.signOut();
                setIsAuthenticated(false);
                navigation.navigate('Login');
              }
            }
          ]
        );
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Sign Up</Text>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setContactNumber(text);
              }}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={birthday ? styles.birthdayText : styles.placeholderText}>
                {birthday ? birthday.toISOString().split('T')[0] : 'Select Birthday'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthday || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setBirthday(selectedDate);
                }}
              />
            )}

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
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={globalStyles.button} onPress={handleSignup}>
              <Text style={globalStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  birthdayText: {
    fontSize: 16,
    color: 'black',
  },
  placeholderText: {
    fontSize: 16,
    color: 'gray',
  },
  link: {
    color: '#AA722A',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
