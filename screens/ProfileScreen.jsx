import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen({ navigation }) {
  const { setIsAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [volunteerID, setVolunteerID] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newData, setNewData] = useState({});
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('currentUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData(user);
            setNewData(user);
          }
          const storedVolunteerID = await AsyncStorage.getItem('volunteerID');
          setVolunteerID(storedVolunteerID);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }, [])
  );

  const handleSaveProfile = async () => {
    if (passwordInput !== userData.password) {
      Alert.alert('Error', 'Incorrect current password. Profile update failed.');
      return;
    }
    if (!newData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      const updatedUser = {
        ...userData,
        ...newData,
        password: newPassword ? newPassword : userData.password
      };
      await AsyncStorage.setItem(userData.email, JSON.stringify(updatedUser));
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setEditing(false);
      setPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Do you wish to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            await AsyncStorage.removeItem('volunteerID');
            setIsAuthenticated(false);
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const [totalDonation, setTotalDonation] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('currentUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData(user);
            setNewData(user);
          }
          const storedVolunteerID = await AsyncStorage.getItem('volunteerID');
          setVolunteerID(storedVolunteerID);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Your Profile</Text>

            {userData ? (
              <>
                <Text style={styles.label}>First Name:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.firstName}
                  onChangeText={(text) => setNewData({ ...newData, firstName: text })}
                  editable={editing}
                />

                <Text style={styles.label}>Last Name:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.lastName}
                  onChangeText={(text) => setNewData({ ...newData, lastName: text })}
                  editable={editing}
                />

                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.email}
                  onChangeText={(text) => setNewData({ ...newData, email: text })}
                  editable={editing}
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Contact Number:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.contactNumber}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) setNewData({ ...newData, contactNumber: text });
                  }}
                  editable={editing}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Birthday:</Text>
                {editing ? (
                  <>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {newData.birthday ? newData.birthday : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={newData.birthday ? new Date(newData.birthday) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setNewData({ ...newData, birthday: selectedDate.toISOString().split('T')[0] });
                          }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <TextInput style={styles.input} value={newData.birthday} editable={false} />
                )}

                {volunteerID && (
                  <>
                    <Text style={styles.label}>Volunteer ID:</Text>
                    <Text style={styles.volunteerID}>{volunteerID}</Text>
                  </>
                )}

                {userData?.totalDonation !== undefined && (
                  <>
                    <Text style={styles.label}>Total Donations:</Text>
                    <Text style={styles.volunteerID}>₱{userData.totalDonation.toFixed(2)}</Text>
                  </>
                )}


                {editing && (
                  <>
                    <Text style={styles.label}>New Password (Optional):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />

                    <Text style={styles.label}>Confirm New Password:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </>
                )}

                {!editing ? (
                  <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Current Password"
                      secureTextEntry
                      value={passwordInput}
                      onChangeText={setPasswordInput}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.detail}>Loading user details...</Text>
            )}

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
  volunteerID: { fontSize: 16, fontWeight: 'bold', color: 'green' },
  editButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 10 },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 10 },
  cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, marginTop: 10 },
  signOutButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  datePickerButton: { padding: 10, borderWidth: 1, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  datePickerText: { fontSize: 16 },
  donationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },

});