import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  baptismFormValidation,
  burialFormValidation,
  weddingFormValidation,
  restrictSacramentBooking,
  getMinimumBookingDate,
} from '../utils';
import BaptismDocuments from '../components/sacrament-documents/BaptismDocuments';
import BurialDocuments from '../components/sacrament-documents/BurialDocuments';
import WeddingDocuments from '../components/sacrament-documents/WeddingDocuments';

export default function DetailedBookingScreen() {
  const { user, userProfile } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { sacrament } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  // Common form fields
  const [formData, setFormData] = useState({
    contact_no: userProfile?.user_mobile || '',
    current_address: '',
    booking_date: new Date(),
    booking_time: new Date(),
    booking_pax: '1',
  });

  // Baptism specific fields
  const [baptismData, setBaptismData] = useState({
    baby_name: '',
    baby_bday: new Date(),
    baby_birthplace: '',
    mother_name: '',
    mother_birthplace: '',
    father_name: '',
    father_birthplace: '',
    marriage_type: '',
    main_godfather: { name: '', age: '', address: '' },
    main_godmother: { name: '', age: '', address: '' },
    additional_godparents: [],
  });

  // Burial specific fields
  const [burialData, setBurialData] = useState({
    deceased_name: '',
    deceased_age: '',
    requested_by: '',
    deceased_relationship: '',
    address: '',
    place_of_mass: '',
    mass_address: '',
  });

  // Wedding specific fields
  const [weddingData, setWeddingData] = useState({
    groom_fullname: '',
    bride_fullname: '',
    groom_1x1: null,
    bride_1x1: null,
    groom_baptismal_cert: null,
    bride_baptismal_cert: null,
    groom_confirmation_cert: null,
    bride_confirmation_cert: null,
  });

  useEffect(() => {
    if (sacrament) {
      // Set minimum booking date based on sacrament
      const minDate = getMinimumBookingDate(sacrament);
      if (minDate) {
        setErrorMessage(`Note: ${minDate} is the earliest available date for ${sacrament}`);
      }
    }
  }, [sacrament]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerField === 'booking_date') {
        setFormData({ ...formData, booking_date: selectedDate });
      } else if (datePickerField === 'baby_bday') {
        setBaptismData({ ...baptismData, baby_bday: selectedDate });
      }
    }
  };

  const showDatePickerModal = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const getSacramentRequirements = (sacrament) => {
    switch (sacrament) {
      case 'Baptism':
        return {
          title: 'Baptism Requirements',
          requirements: [
            'Baby\'s full name, birthday, and birthplace',
            'Mother\'s full name and birthplace',
            'Father\'s full name and birthplace',
            'Type of marriage (Catholic, Civil, Natural, or Not Married)',
            'Contact number and current address',
            'Main godfather (name, age, address)',
            'Main godmother (name, age, address)',
            'Additional godparents (optional, up to 10)',
            'Booking must be made at least 1.5 months in advance'
          ]
        };
      case 'Wedding':
        return {
          title: 'Wedding Requirements',
          requirements: [
            'Groom\'s full name',
            'Bride\'s full name',
            '1x1 photos of both groom and bride',
            'Baptismal certificates of both groom and bride',
            'Confirmation certificates of both groom and bride',
            'Marriage License (if not civilly married)',
            'Marriage Contract (for civil married only)',
            'CENOMAR (Certificate of No Marriage) for both groom and bride',
            'Contact number',
            'Booking must be made at least 1 month in advance'
          ]
        };
      case 'Burial':
        return {
          title: 'Burial Requirements',
          requirements: [
            'Deceased person\'s full name and age',
            'Name of person requesting the service',
            'Relationship to the deceased',
            'Address of the deceased',
            'Place where mass will be held',
            'Address of the mass location',
            'Contact number and current address',
            'Booking must be made at least 3 days in advance'
          ]
        };
      default:
        return {
          title: 'Requirements',
          requirements: ['Please contact the parish office for specific requirements.']
        };
    }
  };

  const showRequirements = (sacrament) => {
    setShowRequirementsModal(true);
  };

  const validateForm = () => {
    // Common validation
    if (!formData.contact_no || !formData.current_address || !formData.booking_date) {
      setErrorMessage('Please fill in all required fields.');
      return false;
    }

    // Sacrament-specific validation
    if (sacrament === 'Baptism') {
      const validationResult = baptismFormValidation(userProfile, baptismData, setErrorMessage);
      if (!validationResult) return false;
    } else if (sacrament === 'Burial') {
      const validationResult = burialFormValidation(userProfile, burialData, setErrorMessage);
      if (!validationResult) return false;
    } else if (sacrament === 'Wedding') {
      const validationResult = weddingFormValidation(weddingData, setErrorMessage);
      if (!validationResult) return false;
    }

    // Check booking restrictions
    const restriction = restrictSacramentBooking(sacrament, formData.booking_date);
    if (restriction !== '') {
      setErrorMessage(restriction);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // Generate transaction ID
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Prepare sacrament-specific data
      let specificDocumentData = {
        date_created: new Date().toISOString(),
      };

      if (sacrament === 'Baptism') {
        specificDocumentData = { ...specificDocumentData, ...baptismData };
      } else if (sacrament === 'Burial') {
        specificDocumentData = { ...specificDocumentData, ...burialData };
      } else if (sacrament === 'Wedding') {
        specificDocumentData = { ...specificDocumentData, ...weddingData };
      }

      // Save sacrament-specific document
      const specificDocumentId = await saveSpecificSacramentDocument({
        selectedSacrament: sacrament,
        specificDocumentTable: specificDocumentData,
        setErrorMessage,
      });

      if (!specificDocumentId) {
        setLoading(false);
        return;
      }

      // Create main booking record
      const bookingData = {
        user_id: user.id,
        booking_sacrament: sacrament,
        booking_date: formData.booking_date.toISOString().split('T')[0],
        booking_time: formData.booking_time.toLocaleTimeString('en-US', { hour12: false }),
        booking_pax: parseInt(formData.booking_pax),
        booking_status: 'pending',
        booking_transaction: transactionId,
        ...(specificDocumentId && sacrament === 'Wedding' ? {
          wedding_docu_id: specificDocumentId
        } : specificDocumentId && sacrament === 'Baptism' ? {
          baptism_docu_id: specificDocumentId
        } : specificDocumentId && sacrament === 'Burial' ? {
          burial_docu_id: specificDocumentId
        } : {}),
      };

      const { error } = await supabase
        .from('booking_tbl')
        .insert([bookingData]);

      if (error) throw error;

      Alert.alert(
        'Booking Confirmed',
        `${sacrament} booking has been submitted successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorMessage('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBaptismForm = () => (
    <View style={styles.formSection}>
      <BaptismDocuments
        baptismForm={baptismData}
        setBaptismForm={setBaptismData}
      />
    </View>
  );

  const renderBurialForm = () => (
    <View style={styles.formSection}>
      <BurialDocuments
        burialForm={burialData}
        setBurialForm={setBurialData}
      />
    </View>
  );

  const renderWeddingForm = () => (
    <View style={styles.formSection}>
      <WeddingDocuments
        weddingForm={weddingData}
        setWeddingForm={setWeddingData}
      />
    </View>
  );

  const renderCommonForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Contact Number *"
        value={formData.contact_no}
        onChangeText={(text) => setFormData({ ...formData, contact_no: text })}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Current Address *"
        value={formData.current_address}
        onChangeText={(text) => setFormData({ ...formData, current_address: text })}
        multiline
      />

      <Text style={styles.sectionTitle}>Booking Details</Text>
      
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => showDatePickerModal('booking_date')}
      >
        <Text style={styles.dateInputText}>
          {formData.booking_date ? 
            formData.booking_date.toLocaleDateString() : 
            'Select Date *'
          }
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Number of Attendees"
        value={formData.booking_pax}
        onChangeText={(text) => setFormData({ ...formData, booking_pax: text })}
        keyboardType="numeric"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{sacrament} Booking</Text>
        <TouchableOpacity
          style={styles.requirementsButton}
          onPress={() => showRequirements(sacrament)}
        >
          <Text style={styles.requirementsButtonText}>Requirements</Text>
        </TouchableOpacity>
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {renderCommonForm()}

      {sacrament === 'Baptism' && renderBaptismForm()}
      {sacrament === 'Burial' && renderBurialForm()}
      {sacrament === 'Wedding' && renderWeddingForm()}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Booking</Text>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={datePickerField === 'booking_date' ? formData.booking_date : baptismData.baby_bday}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Requirements Modal */}
      <Modal
        visible={showRequirementsModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getSacramentRequirements(sacrament)?.title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRequirementsModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.requirementsContent}>
              {getSacramentRequirements(sacrament)?.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRequirementsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  formSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#E1D5B8',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requirementsButton: {
    backgroundColor: '#6B5F32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  requirementsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  requirementsContent: {
    maxHeight: 300,
    marginBottom: 15,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: '#6B5F32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
