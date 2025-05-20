import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../styles/globalStyles';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { setIsAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!firstName || !lastName || !contactNumber || !birthday || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
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
        // 2. Store additional user data in the user_tbl
        const { error: profileError } = await supabase
          .from('user_tbl')
          .insert([
            {
              id: authData.user.id,
              user_firstname: firstName,
              user_middle: middleName,
              user_lastname: lastName,
              user_gender: gender || 'rather not to tell',
              user_status: status || 'single',
              user_mobile: contactNumber,
              user_bday: birthday.toISOString().split('T')[0],
              user_email: email,
              user_pword: password,
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
      console.error('Error during signup:', error);
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
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
              placeholder="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Middle Name"
              value={middleName}
              onChangeText={setMiddleName}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              editable={!loading}
            />

            <Text style={styles.label}>Gender:</Text>
            <View style={styles.radioGroup}>
              {['m', 'f', 'rather not to tell'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.radioOption, gender === g && styles.radioSelected]}
                  onPress={() => setGender(g)}
                  disabled={loading}
                >
                  <Text style={[styles.radioText, gender === g && styles.radioTextSelected]}>
                    {g === 'm' ? 'Male' : g === 'f' ? 'Female' : 'Rather not to tell'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status:</Text>
            <View style={styles.radioGroup}>
              {['single', 'married', 'widow'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.radioOption, status === s && styles.radioSelected]}
                  onPress={() => setStatus(s)}
                  disabled={loading}
                >
                  <Text style={[styles.radioText, status === s && styles.radioTextSelected]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Contact Number *"
              value={contactNumber}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setContactNumber(text);
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={birthday ? styles.birthdayText : styles.placeholderText}>
                {birthday ? birthday.toISOString().split('T')[0] : 'Select Birthday *'}
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
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity 
              style={[globalStyles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
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
  buttonDisabled: {
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radioOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioText: {
    color: '#333',
  },
  radioTextSelected: {
    color: '#fff',
  },
});
