import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
  ScrollView, TextInput, Alert, Linking 
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatBot from '../components/ChatBot';

const upcomingEvents = [
  { id: '1', title: 'Sunday Mass', date: '2025-02-23' },
  { id: '2', title: 'Youth Gathering', date: '2025-02-25' },
];

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('User');
  const [nextEvent, setNextEvent] = useState(null);
  const [showDonate, setShowDonate] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.firstName); 
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUser();
  
    if (upcomingEvents.length > 0) {
      setNextEvent(upcomingEvents[0]);
    }
  }, []);  

  const handleDonate = () => {
    if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }
  
    Alert.alert(
      'Confirm Donation',
      `Are you sure you want to donate ₱${donationAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const storedUser = await AsyncStorage.getItem('currentUser');
              if (storedUser) {
                const user = JSON.parse(storedUser);
                const totalDonation = (user.totalDonation || 0) + Number(donationAmount);
  
                // Update user data with new donation amount
                const updatedUser = { ...user, totalDonation };
                await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
  
                Alert.alert('Thank You!', `You have donated ₱${donationAmount} to the church.`);
                setDonationAmount('');
                setShowDonate(false);
              }
            } catch (error) {
              console.error('Error updating donation:', error);
              Alert.alert('Error', 'Failed to process donation.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };    

  const handleVolunteer = async () => {
    Alert.alert(
      'Volunteer Confirmation',
      'Are you sure you want to become a volunteer?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const uniqueID = `VOL-${Math.floor(100000 + Math.random() * 900000)}`;
            await AsyncStorage.setItem('volunteerID', uniqueID);
            Alert.alert('Success', 'You are now a registered volunteer!');
            navigation.navigate('Profile');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };
  

  return (
    <ImageBackground
      source={{ uri: 'https://source.unsplash.com/featured/?church,prayer' }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}!</Text>
        <Text style={styles.subtitle}>Manage your parish activities, events, and more.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Bookings')}>
            <Ionicons name="book-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Book a Sacrament</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Events')}>
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text style={styles.buttonText}>View Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Virtual Tour')}>
            <Ionicons name="map-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Virtual Tour</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.donateButton} onPress={() => setShowDonate(true)}>
            <Ionicons name="heart-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Donate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.volunteerButton} onPress={handleVolunteer}>
            <Ionicons name="people-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Be a Volunteer</Text>
          </TouchableOpacity>
        </View>

        {showDonate && (
          <View style={styles.donationForm}>
            <Text style={styles.eventTitle}>🙏 Make a Donation</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount (₱)"
              keyboardType="numeric"
              value={donationAmount}
              onChangeText={setDonationAmount}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={handleDonate}>
              <Text style={styles.buttonText}>Confirm Donation</Text>
            </TouchableOpacity>
          </View>
        )}

        {nextEvent && (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>📅 Next Event</Text>
            <Text style={styles.eventName}>{nextEvent.title}</Text>
            <Text style={styles.eventDate}>{nextEvent.date}</Text>
          </View>
        )}

<View style={styles.extraButtons}>
  <TouchableOpacity 
    style={styles.infoButton} 
    onPress={() => openLink('https://yourchurchwebsite.com/contact')}
  >
    <Ionicons name="call-outline" size={24} color="white" />
    <Text style={styles.buttonText}>Contact Us</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.infoButton} 
    onPress={() => openLink('https://yourchurchwebsite.com/faq')}
  >
    <Ionicons name="help-circle-outline" size={24} color="white" />
    <Text style={styles.buttonText}>FAQs</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.facebookButton} 
    onPress={() => openLink('https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello')}
  >
    <Ionicons name="logo-facebook" size={24} color="white" />
    <Text style={styles.buttonText}>Facebook</Text>
  </TouchableOpacity>
</View>

      </ScrollView>
      <ChatBot />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#E1D5B8',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#738054',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '0000000',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    width: 180,
    justifyContent: 'center',
    elevation: 3,
  },
  donateButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    width: 180,
    justifyContent: 'center',
    elevation: 3,
  },
  volunteerButton: {
    backgroundColor: '#ff9900',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    width: 180,
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  donationForm: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
    elevation: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  eventDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  extraButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  infoButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    width: 180,
    justifyContent: 'center',
    elevation: 3,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    width: 180,
    justifyContent: 'center',
    elevation: 3,
  },  
});
