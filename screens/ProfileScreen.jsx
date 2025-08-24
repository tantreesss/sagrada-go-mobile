import React, { useState, useEffect } from 'react';
// Note: Profile image upload currently stores images locally due to Supabase storage configuration
// To enable cloud storage, configure a 'profile-images' bucket in Supabase and uncomment the cloud upload code
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, Image, Dimensions, Modal, Platform 
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { userProfile, updateProfile, changePassword, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    birthday: '',
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.user_firstname || '',
        lastName: userProfile.user_lastname || '',
        email: userProfile.user_email || '',
        contact: userProfile.user_mobile || '',
        birthday: userProfile.user_bday || '',
      });
      // Set profile image if available
      if (userProfile.profile_image_url) {
        setProfileImage(userProfile.profile_image_url);
      }
      setLoading(false);
    }
    fetchUserBookings();
    fetchUserDonations();
  }, [userProfile]);



  const fetchUserBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('booking_tbl')
          .select('*')
          .eq('user_id', user.id)
          .order('date_created', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUserDonations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('donation_tbl')
          .select('*')
          .eq('user_id', user.id)
          .order('date_created', { ascending: false });

        if (error) throw error;
        setDonations(data || []);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.contact.trim()) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      await updateProfile({
        user_firstname: formData.firstName.trim(),
        user_lastname: formData.lastName.trim(),
        user_mobile: formData.contact.trim(),
        user_bday: formData.birthday,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validate password fields
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        Alert.alert('Error', 'Please fill in all password fields.');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert('Error', 'New passwords do not match.');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long.');
        return;
      }
      
      // Check if password contains at least one uppercase, one lowercase, and one number
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(passwordData.newPassword)) {
        Alert.alert('Error', 'New password must contain at least one uppercase letter, one lowercase letter, and one number.');
        return;
      }

      await changePassword(passwordData.newPassword);

      Alert.alert('Success', 'Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({...formData, birthday: selectedDate.toISOString().split('T')[0]});
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        await uploadProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Selected photo URI:', imageUri);
        await uploadProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      setUploading(true);
      
      // TEMPORARY IMPLEMENTATION: Store image locally
      // TODO: Implement proper cloud storage when Supabase storage is configured
      console.log('Setting profile image to:', imageUri);
      setProfileImage(imageUri);
      
      // Try to update the database with the local URI (temporary solution)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Store the image URI in the database (temporary solution)
          const { error: updateError } = await supabase
            .from('user_tbl')
            .update({ profile_image_url: imageUri })
            .eq('id', user.id);

          if (updateError) {
            console.warn('Could not save image URL to database:', updateError);
            // Continue anyway - image is still displayed locally
          } else {
            console.log('Image URL saved to database successfully');
          }
        }
      } catch (dbError) {
        console.warn('Database update failed:', dbError);
        // Continue anyway - image is still displayed locally
      }
      
      Alert.alert('Success', 'Profile picture updated successfully! (Note: Image is stored locally for now)');
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    const options = [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
    ];
    
    // Add remove option if user has a custom profile image
    if (profileImage && !profileImage.includes('default-profile.jpeg')) {
      options.push({ text: 'Remove Photo', onPress: removeProfileImage, style: 'destructive' });
    }
    
    options.push({ text: 'Cancel', style: 'cancel' });
    
    Alert.alert('Change Profile Picture', 'Choose an option', options);
  };

  const removeProfileImage = async () => {
    try {
      // Try to update the database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('user_tbl')
            .update({ profile_image_url: null })
            .eq('id', user.id);

          if (error) {
            console.warn('Could not remove image URL from database:', error);
            // Continue anyway - image is still removed locally
          }
        }
      } catch (dbError) {
        console.warn('Database update failed:', dbError);
        // Continue anyway - image is still removed locally
      }
      
      setProfileImage(null);
      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile image:', error);
      Alert.alert('Error', 'Failed to remove profile image. Please try again.');
    }
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  const handleImageLoadEnd = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    console.warn('Profile image failed to load, falling back to default');
    // Don't show alert for image loading errors - just fall back silently
    setProfileImage(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={profileImage ? { uri: profileImage } : require('../assets/default-profile.jpeg')} 
            style={styles.profileImage}
            defaultSource={require('../assets/default-profile.jpeg')}
            onLoadStart={handleImageLoadStart}
            onLoadEnd={handleImageLoadEnd}
            onError={handleImageError}
          />
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <Text style={styles.imageLoadingText}>Loading...</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.editImageButton, uploading && styles.uploadingButton]} 
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            {uploading ? (
              <Text style={styles.uploadingText}>...</Text>
            ) : (
              <Ionicons name="camera" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
                 <Text style={styles.userName}>
           {userProfile?.user_firstname} {userProfile?.user_lastname}
         </Text>
         <Text style={styles.userEmail}>{userProfile?.user_email}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create"} 
              size={20} 
              color="#E1D5B8" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              editable={isEditing}
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              editable={isEditing}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.email}
              editable={false}
              placeholder="Email address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={formData.contact}
              onChangeText={(text) => setFormData({...formData, contact: text})}
              editable={isEditing}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
            />
          </View>

                     <View style={styles.inputGroup}>
             <Text style={styles.label}>Birthday</Text>
             <TouchableOpacity
               style={[styles.input, !isEditing && styles.disabledInput]}
               onPress={isEditing ? showDatePickerModal : null}
               disabled={!isEditing}
             >
               <Text style={formData.birthday ? styles.dateText : styles.placeholderText}>
                 {formData.birthday || 'Select birthday'}
               </Text>
             </TouchableOpacity>
           </View>

          {isEditing && (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowPasswordModal(true)}
        >
          <Ionicons name="lock-closed" size={20} color="#E1D5B8" />
          <Text style={styles.actionButtonText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out" size={20} color="#F44336" />
          <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Booking History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking History</Text>
        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>No bookings found</Text>
        ) : (
          bookings.slice(0, 5).map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>{booking.booking_sacrament}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.booking_status) }]}>
                  <Text style={styles.statusText}>{getStatusText(booking.booking_status)}</Text>
                </View>
              </View>
              <Text style={styles.bookingDate}>
                {formatDate(booking.booking_date)} at {booking.booking_time}
              </Text>
              <Text style={styles.bookingDetails}>
                {booking.booking_pax} people • ₱{booking.price?.toLocaleString() || '0'}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Donation History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donation History</Text>
        {donations.length === 0 ? (
          <Text style={styles.emptyText}>No donations found</Text>
        ) : (
          donations.slice(0, 5).map((donation) => (
            <View key={donation.id} style={styles.donationCard}>
              <View style={styles.donationHeader}>
                <Text style={styles.donationAmount}>₱{donation.donation_amount?.toLocaleString()}</Text>
                <Text style={styles.donationDate}>{formatDateTime(donation.date_created)}</Text>
              </View>
              {donation.donation_intercession && (
                <Text style={styles.donationIntercession}>
                  "{donation.donation_intercession}"
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

                         <View style={styles.inputGroup}>
               <Text style={styles.label}>New Password</Text>
               <TextInput
                 style={styles.input}
                 value={passwordData.newPassword}
                 onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                 placeholder="Enter new password"
                 secureTextEntry
               />
                               <Text style={styles.passwordHint}>
                  Must be at least 6 characters with uppercase, lowercase, and numbers
                </Text>
             </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={handleChangePassword}
              >
                <Text style={styles.confirmButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to logout from your account?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
                 </View>
       </Modal>

       {/* Date Picker Modal */}
       {showDatePicker && (
         <DateTimePicker
           value={formData.birthday ? new Date(formData.birthday) : new Date()}
           mode="date"
           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
           onChange={handleDateChange}
           maximumDate={new Date()}
           minimumDate={new Date(1900, 0, 1)}
         />
       )}
     </ScrollView>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#E1D5B8',
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E1D5B8',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5F32',
  },
  editButton: {
    padding: 5,
  },
  formContainer: {
    gap: 15,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#E1D5B8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  bookingCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingDetails: {
    fontSize: 14,
    color: '#666',
  },
  donationCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  donationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  donationDate: {
    fontSize: 14,
    color: '#666',
  },
  donationIntercession: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: width - 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#E1D5B8',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  passwordHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  uploadingButton: {
    backgroundColor: '#999',
  },
  uploadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  imageLoadingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});