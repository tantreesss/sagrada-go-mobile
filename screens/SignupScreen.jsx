import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      navigation.navigate('Login'); 
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    const formattedBirthday = birthday.toISOString().split('T')[0];
    const user = { firstName, lastName, contactNumber, birthday: formattedBirthday, email, password };

    try {
      const existingUser = await AsyncStorage.getItem(email);
      if (existingUser) {
        Alert.alert('Error', 'Email is already registered.');
        return;
      }

      await AsyncStorage.setItem(email, JSON.stringify(user));
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to create account.');
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
