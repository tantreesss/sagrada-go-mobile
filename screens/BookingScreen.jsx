import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../styles/globalStyles';
import { restrictSacramentBooking, getMinimumBookingDate } from '../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BookingScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [bookings, setBookings] = useState([]);
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [pax, setPax] = useState('1');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedSacramentForRequirements, setSelectedSacramentForRequirements] = useState('');

  const sacraments = [
    'Baptism',
    'Wedding',
    'Burial',
    'Confirmation',
    'First Communion'
  ];

  const getSacramentInfo = (sacrament) => {
    const minDate = getMinimumBookingDate(sacrament);
    return minDate ? `Minimum booking: ${minDate}` : '';
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
      case 'Confirmation':
        return {
          title: 'Confirmation Requirements',
          requirements: [
            'Baptismal certificate',
            'Confirmation sponsor information',
            'Contact number and current address',
            'Booking must be made at least 2 months in advance'
          ]
        };
      case 'First Communion':
        return {
          title: 'First Communion Requirements',
          requirements: [
            'Baptismal certificate',
            'First Communion sponsor information',
            'Contact number and current address',
            'Booking must be made at least 2 months in advance'
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
    setSelectedSacramentForRequirements(sacrament);
    setShowRequirementsModal(true);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_tbl')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch your bookings.');
    }
  };

  const handleBooking = async () => {
    if (!selectedSacrament) {
      setErrorMessage('Please select a sacrament first.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Please select both date and time.');
      return;
    }

    if (!pax || isNaN(pax) || parseInt(pax) < 1) {
      setErrorMessage('Please enter a valid number of attendees.');
      return;
    }

    // Check booking restrictions
    const restrictionMessage = restrictSacramentBooking(selectedSacrament, date);
    if (restrictionMessage) {
      setErrorMessage(restrictionMessage);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('booking_tbl')
        .insert([
          {
            user_id: user.id,
            booking_sacrament: selectedSacrament,
            booking_date: date.toISOString().split('T')[0],
            booking_time: time.toTimeString().split(' ')[0],
            booking_pax: parseInt(pax),
            booking_transaction: `TRX-${Date.now()}`,
            booking_status: 'pending'
          }
        ]);

      if (error) throw error;

      Alert.alert(
        'Success',
        `Booking confirmed for ${selectedSacrament} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedSacrament('');
              setDate(new Date());
              setTime(new Date());
              setPax('1');
              setErrorMessage('');
              fetchBookings();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingSacrament}>{item.booking_sacrament}</Text>
        <Text style={[
          styles.bookingStatus,
          { color: item.booking_status === 'pending' ? '#FFA500' : '#4CAF50' }
        ]}>
          {item.booking_status === 'pending' ? 'Pending' : 'Confirmed'}
        </Text>
      </View>
      <Text style={styles.bookingDateTime}>
        {new Date(item.booking_date).toLocaleDateString()} at {new Date(`2000-01-01T${item.booking_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.bookingPax}>Attendees: {item.booking_pax}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Book a Sacrament</Text>

        {/* Sacrament Selection */}
        <TouchableOpacity 
          style={styles.selector}
          onPress={() => setShowSacramentModal(true)}
        >
          <Text style={styles.selectorText}>
            {selectedSacrament || 'Select Sacrament'}
          </Text>
        </TouchableOpacity>

        {/* Sacrament Selection Modal */}
        <Modal
          visible={showSacramentModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a Sacrament</Text>
              {sacraments.map((sacrament) => (
                <View key={sacrament} style={styles.sacramentOptionContainer}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setShowSacramentModal(false);
                      // Navigate to detailed booking for complex sacraments
                      if (['Baptism', 'Burial', 'Wedding'].includes(sacrament)) {
                        navigation.navigate('DetailedBooking', { sacrament });
                      } else {
                        setSelectedSacrament(sacrament);
                      }
                    }}
                  >
                    <View style={styles.sacramentOption}>
                      <Text style={styles.modalOptionText}>{sacrament}</Text>
                      <Text style={styles.sacramentInfo}>{getSacramentInfo(sacrament)}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.requirementsButton}
                    onPress={() => showRequirements(sacrament)}
                  >
                    <Text style={styles.requirementsButtonText}>Requirements</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSacramentModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                  {getSacramentRequirements(selectedSacramentForRequirements)?.title}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowRequirementsModal(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.requirementsContent}>
                {getSacramentRequirements(selectedSacramentForRequirements)?.requirements.map((requirement, index) => (
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

        {/* Error Message */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Date and Time Selection */}
        {selectedSacrament ? (
          <View style={styles.selectionContainer}>
            <View style={styles.selectionHeader}>
              <Text style={styles.subtitle}>
                Selected Sacrament: {selectedSacrament}
              </Text>
              <TouchableOpacity
                style={styles.requirementsButton}
                onPress={() => showRequirements(selectedSacrament)}
              >
                <Text style={styles.requirementsButtonText}>View Requirements</Text>
              </TouchableOpacity>
            </View>

            {/* Date Selection */}
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.label}>Select Date:</Text>
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {/* Time Selection */}
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.label}>Select Time:</Text>
              <Text style={styles.dateTimeText}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {/* Number of Attendees */}
            <View style={styles.dateTimeSelector}>
              <Text style={styles.label}>Number of Attendees:</Text>
              <View style={styles.paxContainer}>
                <TouchableOpacity 
                  style={styles.paxButton}
                  onPress={() => {
                    const newPax = Math.max(1, parseInt(pax) - 1);
                    setPax(newPax.toString());
                  }}
                >
                  <Text style={styles.paxButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.paxInput}
                  value={pax}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericValue = text.replace(/[^0-9]/g, '');
                    if (numericValue === '' || parseInt(numericValue) > 0) {
                      setPax(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TouchableOpacity 
                  style={styles.paxButton}
                  onPress={() => {
                    const newPax = parseInt(pax) + 1;
                    setPax(newPax.toString());
                  }}
                >
                  <Text style={styles.paxButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}

            {/* Confirm Booking Button */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Bookings List */}
        <View style={styles.bookingsContainer}>
          <Text style={styles.bookingsTitle}>Your Bookings</Text>
          {bookings.length > 0 ? (
            <FlatList
              data={bookings}
              renderItem={renderBookingItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noBookingsText}>No bookings yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  sacramentOption: {
    alignItems: 'center',
  },
  sacramentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  selectionContainer: {
    marginTop: 20,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  dateTimeSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingsContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  bookingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bookingItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  bookingSacrament: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookingDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingPax: {
    fontSize: 14,
    color: '#666',
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  paxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  paxButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paxButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  paxInput: {
    fontSize: 18,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
  },
  sacramentOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
});