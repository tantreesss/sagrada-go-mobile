import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
  ScrollView, TextInput, Alert, Linking, Modal, Dimensions 
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatBot from '../components/ChatBot';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const upcomingEvents = [
  { 
    id: '1', 
    title: 'Diocesan Youth Day', 
    date: '2025-02-23',
    description: 'A church event for the Youth of the Diocese.',
    image: require('../assets/dyd.jpg')
  },
  { 
    id: '2', 
    title: 'Sagrada Familia Parish Feast Day', 
    date: '2025-03-23',
    description: 'A church event for Feast Day.',
    image: require('../assets/pista.jpg')
  },
  { 
    id: '3', 
    title: 'Sacerdotal Anniversary', 
    date: '2025-11-29',
    description: 'A church event for Sacerdotal Anniversary of the Parish Priest.',
    image: require('../assets/sarcedotal.jpg')
  },
];

const sacraments = [
  { label: 'Wedding', value: 'Wedding', price: 5000 },
  { label: 'Baptism', value: 'Baptism', price: 2000 },
  { label: 'Confession', value: 'Confession', price: 0 },
  { label: 'Anointing of the Sick', value: 'Anointing of the Sick', price: 0 },
  { label: 'First Communion', value: 'First Communion', price: 1500 },
  { label: 'Burial', value: 'Burial', price: 3000 },
];

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('User');
  const [nextEvent, setNextEvent] = useState(null);
  const [showDonate, setShowDonate] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showVolunteer, setShowVolunteer] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationIntercession, setDonationIntercession] = useState('');
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [bookingPax, setBookingPax] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error } = await supabase
            .from('user_tbl')
            .select('user_firstname, is_volunteer')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user_tbl:', error);
            return;
          }

          if (userData) {
            setUsername(userData.user_firstname || 'User');
            setIsVolunteer(userData.is_volunteer || false);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();

    if (upcomingEvents.length > 0) {
      setNextEvent(upcomingEvents[0]);
    }
  }, []);

  const handleDonate = async () => {
    if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const transactionId = `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const { error } = await supabase
        .from('donation_tbl')
        .insert([{
          user_id: user.id,
          donation_amount: Number(donationAmount),
          donation_intercession: donationIntercession || null,
          donation_transaction: transactionId,
          donation_status: 'completed',
          date_created: new Date().toISOString()
        }]);

      if (error) throw error;

      Alert.alert('Thank You!', `You have donated ₱${donationAmount} to the church.`);
      setDonationAmount('');
      setDonationIntercession('');
      setShowDonate(false);
    } catch (error) {
      console.error('Error processing donation:', error);
      Alert.alert('Error', 'Failed to process donation.');
    }
  };

  const handleBooking = async () => {
    if (!selectedSacrament || !bookingPax || bookingPax <= 0) {
      Alert.alert('Invalid Booking', 'Please fill in all required fields.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const selectedSacramentData = sacraments.find(s => s.value === selectedSacrament);
      
      const { error } = await supabase
        .from('booking_tbl')
        .insert([{
          user_id: user.id,
          booking_sacrament: selectedSacrament,
          booking_date: bookingDate.toISOString().split('T')[0],
          booking_time: bookingTime.toLocaleTimeString('en-US', { hour12: false }),
          booking_pax: parseInt(bookingPax),
          booking_status: 'pending',
          booking_transaction: transactionId,
          price: selectedSacramentData?.price || 0,
        }]);

      if (error) throw error;

      Alert.alert(
        'Booking Confirmed', 
        `Your ${selectedSacrament} booking has been submitted for approval.`
      );
      setSelectedSacrament('');
      setBookingPax('');
      setShowBooking(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking.');
    }
  };

  const handleVolunteer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const { error } = await supabase
        .from('user_tbl')
        .update({ is_volunteer: true })
        .eq('id', user.id);

      if (error) throw error;

      setIsVolunteer(true);
      Alert.alert('Success', 'You are now registered as a volunteer!');
      setShowVolunteer(false);
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      Alert.alert('Error', 'Failed to register as volunteer.');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground 
        source={require('../assets/sagrada.jpg')} 
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back, {username}!</Text>
          <Text style={styles.subtitle}>Sagrada Familia Parish</Text>
        </View>
      </ImageBackground>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => setShowBooking(true)}
        >
          <Ionicons name="calendar" size={24} color="#E1D5B8" />
          <Text style={styles.actionText}>Book Sacrament</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => setShowDonate(true)}
        >
          <Ionicons name="heart" size={24} color="#E1D5B8" />
          <Text style={styles.actionText}>Donate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('Events')}
        >
          <Ionicons name="calendar-outline" size={24} color="#E1D5B8" />
          <Text style={styles.actionText}>Events</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('BookingList')}
        >
          <Ionicons name="list" size={24} color="#E1D5B8" />
          <Text style={styles.actionText}>My Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('VirtualTour')}
        >
          <Ionicons name="eye" size={24} color="#E1D5B8" />
          <Text style={styles.actionText}>Virtual Tour</Text>
        </TouchableOpacity>
      </View>

      {/* Next Event */}
      {nextEvent && (
        <View style={styles.eventCard}>
          <Text style={styles.sectionTitle}>Next Event</Text>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{nextEvent.title}</Text>
            <Text style={styles.eventDate}>{nextEvent.date}</Text>
            <Text style={styles.eventDescription}>{nextEvent.description}</Text>
          </View>
        </View>
      )}

      {/* Volunteer Status */}
      <View style={styles.volunteerCard}>
        <Text style={styles.sectionTitle}>Volunteer Status</Text>
        {isVolunteer ? (
          <View style={styles.volunteerActive}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.volunteerText}>You are an active volunteer</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.volunteerButton}
            onPress={() => setShowVolunteer(true)}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.volunteerButtonText}>Become a Volunteer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ChatBot */}
      <ChatBot />

      {/* Donation Modal */}
      <Modal
        visible={showDonate}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDonate(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make a Donation</Text>
            <Text style={styles.modalSubtitle}>
              Support our parish by making a donation. Your generosity helps us continue our mission.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={donationAmount}
              onChangeText={setDonationAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Donation Intercession (Optional)"
              value={donationIntercession}
              onChangeText={setDonationIntercession}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowDonate(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={handleDonate}
              >
                <Text style={styles.confirmButtonText}>Confirm Donation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBooking}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBooking(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book a Sacrament</Text>
            <Text style={styles.modalSubtitle}>
              Reserve a date and time for your chosen sacrament below.
            </Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSacrament}
                onValueChange={setSelectedSacrament}
                style={styles.picker}
              >
                <Picker.Item label="Select Sacrament" value="" />
                {sacraments.map((sacrament) => (
                  <Picker.Item 
                    key={sacrament.value} 
                    label={`${sacrament.label} - ₱${sacrament.price.toLocaleString()}`} 
                    value={sacrament.value} 
                  />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateButtonText}>
                {formatDate(bookingDate)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.dateButtonText}>
                {formatTime(bookingTime)}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Number of People"
              value={bookingPax}
              onChangeText={setBookingPax}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowBooking(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={handleBooking}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Volunteer Modal */}
      <Modal
        visible={showVolunteer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVolunteer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Become a Volunteer</Text>
            <Text style={styles.modalSubtitle}>
              Join our community of volunteers and help serve our parish. Volunteers assist with various church activities and events.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowVolunteer(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={handleVolunteer}
              >
                <Text style={styles.confirmButtonText}>Join as Volunteer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={bookingDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setBookingDate(selectedDate);
          }}
          minimumDate={new Date()}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={bookingTime}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) setBookingTime(selectedDate);
          }}
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    borderRadius: 0,
  },
  headerContent: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E1D5B8',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventCard: {
    backgroundColor: 'white',
    margin: 20,
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
    color: '#6B5F32',
    marginBottom: 15,
  },
  eventContent: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  volunteerCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  volunteerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  volunteerButton: {
    backgroundColor: '#E1D5B8',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  dateButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
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
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
