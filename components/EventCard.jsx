import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function EventCard({ event }) {
  return (
    <View style={styles.card}>
      <Image 
        source={typeof event.image === 'string' ? { uri: event.image } : event.image} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{event.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 3,
    width: '90%',  // Ensures consistent card width
    alignSelf: 'center',  // Centers the card
  },
  image: {
    width: '100%', // Ensures the image takes full width of the card
    height: 200, // Increase height for better visibility
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});
