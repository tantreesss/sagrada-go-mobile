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



export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('User');
  const [nextEvent, setNextEvent] = useState(null);
  const [showDonate, setShowDonate] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationIntercession, setDonationIntercession] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get username from auth metadata instead of database
          const firstName = user.user_metadata?.user_firstname || 'User';
          setUsername(firstName);
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
