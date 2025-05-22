import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, setIsAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [volunteerID, setVolunteerID] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newData, setNewData] = useState({});
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user profile from user_tbl in Supabase
      const { data, error } = await supabase
        .from('user_tbl')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserData(data);
        setNewData(data);
        // Fetch profile image if exists
        if (data.profile_image_url) {
          setProfileImage(data.profile_image_url);
        }
      }

      // Check volunteer status from AsyncStorage
      const volunteerID = await AsyncStorage.getItem('volunteerID');
      if (volunteerID) {
        setVolunteerID(volunteerID);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `${user.id}-${Date.now()}.jpg`;
      const filePath = `profile-images/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update user profile with new image URL
      const { error: updateError } = await supabase
        .from('user_tbl')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!newData.user_email.includes('@')) {
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
      setLoading(true);

      // Update auth password if changed
      if (newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (authError) throw authError;
      }

      // Update user profile in user_tbl (do not update password here)
      const { error: profileError } = await supabase
        .from('user_tbl')
        .update({
          user_firstname: newData.user_firstname,
          user_middle: newData.user_middle,
          user_lastname: newData.user_lastname,
          user_gender: newData.user_gender,
          user_status: newData.user_status,
          user_mobile: newData.user_mobile,
          user_bday: newData.user_bday,
          user_email: newData.user_email
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setUserData(newData);
      setEditing(false);
      setPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
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
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out.');
              return;
            }
            setIsAuthenticated(false);
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Your Profile</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : userData ? (
              <>
                <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImagePlaceholderText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>First Name:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.user_firstname}
                  onChangeText={(text) => setNewData({ ...newData, user_firstname: text })}
                  editable={editing}
                />

                <Text style={styles.label}>Middle Name:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.user_middle}
                  onChangeText={(text) => setNewData({ ...newData, user_middle: text })}
                  editable={editing}
                />

                <Text style={styles.label}>Last Name:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.user_lastname}
                  onChangeText={(text) => setNewData({ ...newData, user_lastname: text })}
                  editable={editing}
                />

                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.user_email}
                  onChangeText={(text) => setNewData({ ...newData, user_email: text })}
                  editable={editing}
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Contact Number:</Text>
                <TextInput
                  style={styles.input}
                  value={newData.user_mobile}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) setNewData({ ...newData, user_mobile: text });
                  }}
                  editable={editing}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Gender:</Text>
                <View style={styles.radioGroup}>
                  {['m', 'f', 'rather not to tell'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.radioOption,
                        newData.user_gender === gender && styles.radioSelected
                      ]}
                      onPress={() => setNewData({ ...newData, user_gender: gender })}
                      disabled={!editing}
                    >
                      <Text style={[
                        styles.radioText,
                        newData.user_gender === gender && styles.radioTextSelected
                      ]}>
                        {gender === 'm' ? 'Male' : gender === 'f' ? 'Female' : 'Rather not to tell'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Status:</Text>
                <View style={styles.radioGroup}>
                  {['single', 'married', 'widow'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.radioOption,
                        newData.user_status === status && styles.radioSelected
                      ]}
                      onPress={() => setNewData({ ...newData, user_status: status })}
                      disabled={!editing}
                    >
                      <Text style={[
                        styles.radioText,
                        newData.user_status === status && styles.radioTextSelected
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Birthday:</Text>
                {editing ? (
                  <>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {newData.user_bday ? new Date(newData.user_bday).toLocaleDateString() : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={newData.user_bday ? new Date(newData.user_bday) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setNewData({ ...newData, user_bday: selectedDate.toISOString().split('T')[0] });
                          }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <TextInput 
                    style={styles.input} 
                    value={new Date(userData.user_bday).toLocaleDateString()} 
                    editable={false} 
                  />
                )}

                {volunteerID && (
                  <View style={styles.volunteerStatusContainer}>
                    <Text style={styles.volunteerStatusLabel}>Volunteer Status:</Text>
                    <View style={styles.volunteerStatus}>
                      <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                      <Text style={styles.volunteerStatusText}>Active Volunteer</Text>
                    </View>
                    <Text style={styles.volunteerID}>ID: {volunteerID}</Text>
                  </View>
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
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={() => {
                        setEditing(false);
                        setNewData(userData);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
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
  editButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 10, width: '100%' },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 10, width: '100%' },
  cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, marginTop: 10, width: '100%' },
  signOutButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, marginTop: 20, width: '100%' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  datePickerButton: { 
    width: '100%',
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 5, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  datePickerText: { fontSize: 16 },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%'
  },
  radioOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  },
  radioText: {
    color: '#333'
  },
  radioTextSelected: {
    color: '#fff'
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  profileImagePlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  volunteerStatusContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  volunteerStatusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  volunteerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  volunteerStatusText: {
    fontSize: 16,
    color: '#28a745',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  volunteerID: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});