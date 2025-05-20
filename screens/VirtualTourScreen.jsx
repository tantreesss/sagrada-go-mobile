import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function VirtualTourScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Explore the Parish</Text>
      <Text>Coming soon...</Text>
    </View>
  );
}
