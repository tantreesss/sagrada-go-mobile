import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CertificateRequestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    baptismDate: '',
    confirmationDate: '',
    requestType: 'baptism', // 'baptism' or 'confirmation'
    purpose: '',
    contactNumber: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error } = await supabase
            .from('user_tbl')
            .select('user_firstname, user_lastname, user_bday, user_mobile, user_email')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user_tbl:', error);
            return;
          }

          if (userData) {
            setFormData(prev => ({
              ...prev,
              fullName: `${userData.user_firstname || ''} ${userData.user_lastname || ''}`.trim(),
              birthDate: userData.user_bday || '',
              contactNumber: userData.user_mobile || '',
              email: userData.user_email || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error in fetchUserInfo:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.birthDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return false;
    }
    if (formData.requestType === 'baptism' && !formData.baptismDate) {
      Alert.alert('Missing Information', 'Please provide baptism date.');
      return false;
    }
    if (formData.requestType === 'confirmation' && !formData.confirmationDate) {
      Alert.alert('Missing Information', 'Please provide confirmation date.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to submit a request.');
        return;
      }

      const insertData = {
        user_id: user.id,
        request_baptismcert: formData.requestType === 'baptism' ? formData.baptismDate : null,
        request_confirmationcert: formData.requestType === 'confirmation' ? formData.confirmationDate : null,
      };

      const { error } = await supabase
        .from('request_tbl')
        .insert([insertData]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your certificate request has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Certificate Request</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.requestType === 'baptism' && styles.selectedType
              ]}
              onPress={() => handleInputChange('requestType', 'baptism')}
            >
              <Text style={[
                styles.typeButtonText,
                formData.requestType === 'baptism' && styles.selectedTypeText
              ]}>Baptism Certificate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.requestType === 'confirmation' && styles.selectedType
              ]}
              onPress={() => handleInputChange('requestType', 'confirmation')}
            >
              <Text style={[
                styles.typeButtonText,
                formData.requestType === 'confirmation' && styles.selectedTypeText
              ]}>Confirmation Certificate</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={formData.fullName}
            editable={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Birth Date (YYYY-MM-DD) *"
            value={formData.birthDate}
            editable={false}
          />

          {formData.requestType === 'baptism' ? (
            <TextInput
              style={styles.input}
              placeholder="Baptism Date (YYYY-MM-DD) *"
              value={formData.baptismDate}
              onChangeText={(value) => handleInputChange('baptismDate', value)}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Confirmation Date (YYYY-MM-DD) *"
              value={formData.confirmationDate}
              onChangeText={(value) => handleInputChange('confirmationDate', value)}
            />
          )}

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Purpose of Request *"
            value={formData.purpose}
            onChangeText={(value) => handleInputChange('purpose', value)}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={formData.contactNumber}
            editable={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            editable={false}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CertificateRequestScreen; 