import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VolunteerScreen({ navigation }) {
  const handleVolunteerRegistration = async () => {
    const generatedID = `VOL-${Math.floor(1000 + Math.random() * 9000)}`;
    await AsyncStorage.setItem('volunteerID', generatedID);
    Alert.alert('Success', `You are now a volunteer! Your ID: ${generatedID}`);
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Become a Volunteer</Text>
      <Text style={styles.description}>Join us in making a difference!</Text>
      <TouchableOpacity style={styles.registerButton} onPress={handleVolunteerRegistration}>
        <Text style={styles.registerButtonText}>Register as Volunteer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  registerButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
