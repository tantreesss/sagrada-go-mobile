import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import EventCard from '../components/EventCard';
import { globalStyles } from '../styles/globalStyles';

const mockEvents = [
  {
    id: '1',
    title: 'Feast of Sto. Nino',
    date: '2025-01-19',
    image: require('../assets/stonino.jpg'),
  },
  {
    id: '2',
    title: 'Diocesan Youth Day',
    date: '2025-08-31',
    image: require('../assets/dyd.jpg'),
  },
  {
    id: '4',
    title: 'Sacerdotal Anniversary',
    date: '2025-11-22',
    image: require('../assets/sarcedotal.jpg'),
  },
  {
    id: '3',
    title: 'Kids Gift Giving',
    date: '2025-12-26',
    image: require('../assets/gift.jpg'),
  },
];

export default function EventsScreen() {
  const [events] = useState(mockEvents);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Upcoming Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        removeClippedSubviews={false}  // Ensures images load properly
      />
    </View>
  );
}
