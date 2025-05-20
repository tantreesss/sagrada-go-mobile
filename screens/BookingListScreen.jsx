import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function BookingListScreen({ route }) {
  const { bookings } = route.params;

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Your Bookings</Text>

      {bookings.length === 0 ? (
        <Text style={globalStyles.subtitle}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.listItem}>
              <Text style={globalStyles.subtitle}>Sacrament: {item.sacrament}</Text>
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
