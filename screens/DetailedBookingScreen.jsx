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

export default function DetailedBookingScreen() {
  const { user, userProfile } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { sacrament } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');

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

  const validateForm = () => {
    // Check booking restrictions
    const restrictionMessage = restrictSacramentBooking(sacrament, formData.booking_date);
    if (restrictionMessage) {
      setErrorMessage(restrictionMessage);
      return false;
    }

    // Validate based on sacrament type
    switch (sacrament) {
      case 'Baptism':
        return baptismFormValidation(userProfile, baptismData, setErrorMessage);
      case 'Burial':
        return burialFormValidation(userProfile, burialData, setErrorMessage);
      case 'Wedding':
        return weddingFormValidation(weddingData, setErrorMessage);
      default:
        // Basic validation for other sacraments
        if (!formData.contact_no || !formData.current_address) {
          setErrorMessage('Please fill in all required fields.');
          return false;
        }
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Create the booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('booking_tbl')
        .insert([
          {
            user_id: user.id,
            booking_sacrament: sacrament,
            booking_date: formData.booking_date.toISOString().split('T')[0],
            booking_time: formData.booking_time.toTimeString().split(' ')[0],
            booking_pax: parseInt(formData.booking_pax),
            booking_transaction: `TRX-${Date.now()}`,
            booking_status: 'pending',
            contact_no: formData.contact_no,
            current_address: formData.current_address,
          }
        ])
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      // Create sacrament-specific document if needed
      let documentId = null;
      if (['Baptism', 'Burial', 'Wedding'].includes(sacrament)) {
        const specificDocumentTable = {
          booking_id: bookingData.id,
          ...(sacrament === 'Baptism' && baptismData),
          ...(sacrament === 'Burial' && burialData),
          ...(sacrament === 'Wedding' && weddingData),
        };

        const { saveSpecificSacramentDocument } = await import('../utils');
        documentId = await saveSpecificSacramentDocument({
          selectedSacrament: sacrament,
          specificDocumentTable,
          setErrorMessage,
        });
      }

      Alert.alert(
        'Success',
        `${sacrament} booking submitted successfully! We will contact you soon.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
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
      <Text style={styles.sectionTitle}>Baby Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Baby's Full Name *"
        value={baptismData.baby_name}
        onChangeText={(text) => setBaptismData({ ...baptismData, baby_name: text })}
      />

      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => showDatePickerModal('baby_bday')}
      >
        <Text style={styles.dateInputText}>
          {baptismData.baby_bday ? 
            baptismData.baby_bday.toLocaleDateString() : 
            'Baby\'s Birth Date *'
          }
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Place of Birth *"
        value={baptismData.baby_birthplace}
        onChangeText={(text) => setBaptismData({ ...baptismData, baby_birthplace: text })}
      />

      <Text style={styles.sectionTitle}>Parent Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Mother's Full Name *"
        value={baptismData.mother_name}
        onChangeText={(text) => setBaptismData({ ...baptismData, mother_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Mother's Place of Birth *"
        value={baptismData.mother_birthplace}
        onChangeText={(text) => setBaptismData({ ...baptismData, mother_birthplace: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Father's Full Name *"
        value={baptismData.father_name}
        onChangeText={(text) => setBaptismData({ ...baptismData, father_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Father's Place of Birth *"
        value={baptismData.father_birthplace}
        onChangeText={(text) => setBaptismData({ ...baptismData, father_birthplace: text })}
      />

      <Text style={styles.sectionTitle}>Godparents Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Name *"
        value={baptismData.main_godfather.name}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godfather: { ...baptismData.main_godfather, name: text }
        })}
      />

      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Age *"
        value={baptismData.main_godfather.age}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godfather: { ...baptismData.main_godfather, age: text }
        })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Address *"
        value={baptismData.main_godfather.address}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godfather: { ...baptismData.main_godfather, address: text }
        })}
      />

      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Name *"
        value={baptismData.main_godmother.name}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godmother: { ...baptismData.main_godmother, name: text }
        })}
      />

      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Age *"
        value={baptismData.main_godmother.age}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godmother: { ...baptismData.main_godmother, age: text }
        })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Address *"
        value={baptismData.main_godmother.address}
        onChangeText={(text) => setBaptismData({
          ...baptismData,
          main_godmother: { ...baptismData.main_godmother, address: text }
        })}
      />
    </View>
  );

  const renderBurialForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Deceased Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Deceased Person's Name *"
        value={burialData.deceased_name}
        onChangeText={(text) => setBurialData({ ...burialData, deceased_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Age *"
        value={burialData.deceased_age}
        onChangeText={(text) => setBurialData({ ...burialData, deceased_age: text })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Requested By *"
        value={burialData.requested_by}
        onChangeText={(text) => setBurialData({ ...burialData, requested_by: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Relationship to Deceased *"
        value={burialData.deceased_relationship}
        onChangeText={(text) => setBurialData({ ...burialData, deceased_relationship: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Address *"
        value={burialData.address}
        onChangeText={(text) => setBurialData({ ...burialData, address: text })}
      />

      <Text style={styles.sectionTitle}>Mass Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Place of Mass *"
        value={burialData.place_of_mass}
        onChangeText={(text) => setBurialData({ ...burialData, place_of_mass: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Mass Address *"
        value={burialData.mass_address}
        onChangeText={(text) => setBurialData({ ...burialData, mass_address: text })}
      />
    </View>
  );

  const renderWeddingForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Couple Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Groom's Full Name *"
        value={weddingData.groom_fullname}
        onChangeText={(text) => setWeddingData({ ...weddingData, groom_fullname: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Bride's Full Name *"
        value={weddingData.bride_fullname}
        onChangeText={(text) => setWeddingData({ ...weddingData, bride_fullname: text })}
      />

      <Text style={styles.sectionTitle}>Required Documents</Text>
      <Text style={styles.documentNote}>
        Note: Document uploads will be handled in a future update. For now, please prepare the following documents:
      </Text>
      
      <View style={styles.documentList}>
        <Text style={styles.documentItem}>• 1x1 photos of both Groom and Bride</Text>
        <Text style={styles.documentItem}>• Baptismal certificates of both Groom and Bride</Text>
        <Text style={styles.documentItem}>• Confirmation certificates of both Groom and Bride</Text>
      </View>
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
        <View style={{ width: 24 }} />
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={datePickerField === 'baby_bday' ? new Date() : undefined}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
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
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  formSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  documentNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  documentList: {
    marginBottom: 15,
  },
  documentItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#E1D5B8',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
