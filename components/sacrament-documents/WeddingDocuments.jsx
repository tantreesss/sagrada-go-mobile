import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const WeddingDocuments = ({ weddingForm, setWeddingForm }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = async (fieldName) => {
    try {
      setIsProcessing(true);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
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
        setWeddingForm(prev => ({
          ...prev,
          [fieldName]: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderImageUpload = (fieldName, title, description = '') => (
    <TouchableOpacity
      style={styles.uploadCard}
      onPress={() => pickImage(fieldName)}
      disabled={isProcessing}
    >
      <Text style={styles.uploadTitle}>{title}</Text>
      {description && <Text style={styles.uploadDescription}>{description}</Text>}
      
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <Ionicons name="hourglass-outline" size={24} color="#666" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      ) : weddingForm[fieldName] ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: weddingForm[fieldName] }} style={styles.uploadedImage} />
          <Text style={styles.uploadedText}>Uploaded</Text>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <Ionicons name="image-outline" size={24} color="#999" />
          <Text style={styles.uploadText}>Click to upload</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>
        For weddings, please ensure you have the necessary documents ready for submission.
      </Text>
      
      {/* Couple Information */}
      <Text style={styles.sectionHeader}>Couple Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Groom's Full Name *"
        value={weddingForm.groom_fullname || ''}
        onChangeText={(text) => setWeddingForm({ ...weddingForm, groom_fullname: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Bride's Full Name *"
        value={weddingForm.bride_fullname || ''}
        onChangeText={(text) => setWeddingForm({ ...weddingForm, bride_fullname: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number *"
        value={weddingForm.contact_no || ''}
        onChangeText={(text) => setWeddingForm({ ...weddingForm, contact_no: text })}
        keyboardType="phone-pad"
      />

      <View style={styles.divider} />

      {/* Marriage Documents */}
      <Text style={styles.sectionHeader}>Marriage Documents</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload(
          'marriage_license',
          'Marriage License',
          'No need if Civilly Married'
        )}
        {renderImageUpload(
          'marriage_contract',
          'Marriage Contract',
          'For Civil Married Only'
        )}
      </View>

      <View style={styles.divider} />

      {/* CENOMAR */}
      <Text style={styles.sectionHeader}>
        CENOMAR (Certificate of No Marriage) - No need if Civilly Married
      </Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_cenomar', 'Groom\'s CENOMAR')}
        {renderImageUpload('bride_cenomar', 'Bride\'s CENOMAR')}
      </View>

      <View style={styles.divider} />

      {/* ID Photos */}
      <Text style={styles.sectionHeader}>1x1 ID Photos</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_1x1', 'Groom Photo')}
        {renderImageUpload('bride_1x1', 'Bride Photo')}
      </View>

      <View style={styles.divider} />

      {/* Baptismal Certificates */}
      <Text style={styles.sectionHeader}>Baptismal Certificates</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_baptismal_cert', 'Groom Baptismal Certificate')}
        {renderImageUpload('bride_baptismal_cert', 'Bride Baptismal Certificate')}
      </View>

      <View style={styles.divider} />

      {/* Confirmation Certificates */}
      <Text style={styles.sectionHeader}>Confirmation Certificates</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_confirmation_cert', 'Groom Confirmation Certificate')}
        {renderImageUpload('bride_confirmation_cert', 'Bride Confirmation Certificate')}
      </View>

      <View style={styles.divider} />

      {/* Banns and Permissions */}
      <Text style={styles.sectionHeader}>Banns of Marriage</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_banns', 'Groom Banns')}
        {renderImageUpload('bride_banns', 'Bride Banns')}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionHeader}>Permission (if applicable)</Text>
      <View style={styles.uploadGrid}>
        {renderImageUpload('groom_permission', 'Groom Permission')}
        {renderImageUpload('bride_permission', 'Bride Permission')}
      </View>

      <View style={styles.divider} />

      {/* Activities Information */}
      <Text style={styles.sectionHeader}>
        Please be prepared for the following activities:
      </Text>
      <View style={styles.activitiesList}>
        <Text style={styles.activityItem}>• Wedding Questionnaires</Text>
        <Text style={styles.activityItem}>• Canonical Interview</Text>
        <Text style={styles.activityItem}>• Pre-Cana Seminar</Text>
        <Text style={styles.activityItem}>• Confession</Text>
        <Text style={styles.activityItem}>• Invitation Card for Motif Reference</Text>
        <Text style={styles.activityItem}>• Banns of Marriage</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 16,
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  processingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  uploadedImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginBottom: 4,
  },
  uploadedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  uploadText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activitiesList: {
    marginBottom: 16,
  },
  activityItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default WeddingDocuments;
