import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookingScreen() {
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState('');
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookings, setBookings] = useState([]);
  const navigation = useNavigation();

  const sacraments = [
    'Wedding',
    'Baptism',
    'Confession',
    'Anointing of the Sick'
  ];

  const handleBooking = () => {
    if (!selectedSacrament) {
      setErrorMessage('Please select a sacrament first.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Please select both date and time.');
      return;
    }

    // Create new booking
    const newBooking = {
      id: Date.now().toString(),
      sacrament: selectedSacrament,
      date: date,
      time: time,
      status: 'Pending'
    };

    // Add to bookings list
    setBookings([...bookings, newBooking]);

    setErrorMessage('');
    alert(`Booking confirmed for ${selectedSacrament} on ${date.toDateString()} at ${time.toLocaleTimeString()}`);
    
    // Reset form
    setSelectedSacrament('');
    setDate(new Date());
    setTime(new Date());
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
        <Text style={styles.bookingSacrament}>{item.sacrament}</Text>
        <Text style={[
          styles.bookingStatus,
          { color: item.status === 'Pending' ? '#FFA500' : '#4CAF50' }
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.bookingDateTime}>
        {item.date.toLocaleDateString()} at {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Book a Sacrament</Text>

        {/* Sacrament Selection */}
        <TouchableOpacity 
          style={styles.sacramentSelector}
          onPress={() => setShowSacramentModal(true)}
        >
          <Text style={styles.sacramentSelectorText}>
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
                <TouchableOpacity
                  key={sacrament}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedSacrament(sacrament);
                    setShowSacramentModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{sacrament}</Text>
                </TouchableOpacity>
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

        {/* Error Message */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Date and Time Selection */}
        {selectedSacrament ? (
          <View style={styles.selectionContainer}>
            <Text style={styles.subtitle}>
              Selected Sacrament: {selectedSacrament}
            </Text>

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
            <TouchableOpacity style={styles.button} onPress={handleBooking}>
              <Text style={styles.buttonText}>Confirm Booking</Text>
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
  sacramentSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  sacramentSelectorText: {
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
  },
  modalOptionText: {
    fontSize: 16,
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
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
});