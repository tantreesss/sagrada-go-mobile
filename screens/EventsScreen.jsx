import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, Alert 
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const events = [
  {
    id: '1',
    title: 'Diocesan Youth Day',
    date: '2025-02-23',
    description: 'A church event for the Youth of the Diocese.',
    image: require('../assets/dyd.jpg'),
    location: 'Sagrada Familia Parish',
    time: '9:00 AM - 5:00 PM'
  },
  {
    id: '2',
    title: 'Sagrada Familia Parish Feast Day',
    date: '2025-03-23',
    description: 'A church event for Feast Day.',
    image: require('../assets/pista.jpg'),
    location: 'Sagrada Familia Parish',
    time: '8:00 AM - 6:00 PM'
  },
  {
    id: '3',
    title: 'Sacerdotal Anniversary',
    date: '2025-11-29',
    description: 'A church event for Sacerdotal Anniversary of the Parish Priest.',
    image: require('../assets/sarcedotal.jpg'),
    location: 'Sagrada Familia Parish',
    time: '7:00 AM - 8:00 PM'
  },
  {
    id: '4',
    title: 'Christmas Mass',
    date: '2025-12-25',
    description: 'Special Christmas Mass celebration.',
    image: require('../assets/christmas.jpg'),
    location: 'Sagrada Familia Parish',
    time: '12:00 AM - 1:30 AM'
  },
  {
    id: '5',
    title: 'New Year Mass',
    date: '2026-01-01',
    description: 'New Year Mass and celebration.',
    image: require('../assets/birthday.jpg'),
    location: 'Sagrada Familia Parish',
    time: '12:00 AM - 1:30 AM'
  }
];

export default function EventsScreen({ navigation }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleRegisterEvent = async (event) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to register for events.');
        return;
      }

      // Check if user is already registered
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .single();

      if (existingRegistration) {
        Alert.alert('Already Registered', 'You are already registered for this event.');
        return;
      }

      // Register for event
      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          user_id: user.id,
          event_id: event.id,
          registration_date: new Date().toISOString(),
          status: 'registered'
        }]);

      if (error) throw error;

      Alert.alert('Success', 'You have successfully registered for this event!');
      setShowEventDetails(false);
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', 'Failed to register for event. Please try again.');
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past Event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days away`;
  };

  const getEventStatus = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays <= 7) return 'upcoming';
    return 'future';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parish Events</Text>
        <Text style={styles.headerSubtitle}>Stay updated with our upcoming events</Text>
      </View>

      <View style={styles.eventsContainer}>
        {events.map((event) => {
          const status = getEventStatus(event.date);
          const daysUntil = getDaysUntilEvent(event.date);
          
          return (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, status === 'past' && styles.pastEvent]}
              onPress={() => handleEventPress(event)}
              disabled={status === 'past'}
            >
              <Image source={event.image} style={styles.eventImage} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.statusBadge, styles[`status${status}`]]}>
                    <Text style={styles.statusText}>
                      {status === 'past' ? 'Past' : status === 'upcoming' ? 'Upcoming' : 'Future'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
                
                <View style={styles.eventFooter}>
                  <Text style={styles.daysUntil}>{daysUntil}</Text>
                  {status !== 'past' && (
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={() => handleRegisterEvent(event)}
                    >
                      <Ionicons name="calendar" size={16} color="white" />
                      <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Event Details Modal */}
      {selectedEvent && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Image source={selectedEvent.image} style={styles.modalImage} />
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowEventDetails(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={20} color="#E1D5B8" />
                  <Text style={styles.infoText}>{formatDate(selectedEvent.date)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color="#E1D5B8" />
                  <Text style={styles.infoText}>{selectedEvent.time}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#E1D5B8" />
                  <Text style={styles.infoText}>{selectedEvent.location}</Text>
                </View>
              </View>
              
              <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
              
              {getEventStatus(selectedEvent.date) !== 'past' && (
                <TouchableOpacity
                  style={styles.modalRegisterButton}
                  onPress={() => handleRegisterEvent(selectedEvent)}
                >
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text style={styles.modalRegisterButtonText}>Register for Event</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
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
    backgroundColor: '#E1D5B8',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  eventsContainer: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  pastEvent: {
    opacity: 0.7,
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusupcoming: {
    backgroundColor: '#FF9800',
  },
  statusfuture: {
    backgroundColor: '#4CAF50',
  },
  statuspast: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysUntil: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  registerButton: {
    backgroundColor: '#E1D5B8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width - 40,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalInfo: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalRegisterButton: {
    backgroundColor: '#E1D5B8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  modalRegisterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
