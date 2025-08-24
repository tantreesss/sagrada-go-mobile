import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const BurialDocuments = ({ burialForm, setBurialForm }) => {
  const toggleService = (service) => {
    setBurialForm(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>
        For funeral, please ensure you have the necessary information.
      </Text>
      
      {/* Deceased Information */}
      <Text style={styles.sectionHeader}>Deceased Information</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flexInput]}
          placeholder="Deceased's Name *"
          value={burialForm.deceased_name || ''}
          onChangeText={(text) => setBurialForm({ ...burialForm, deceased_name: text })}
        />
        <TextInput
          style={[styles.input, styles.ageInput]}
          placeholder="Age *"
          value={burialForm.deceased_age || ''}
          onChangeText={(text) => setBurialForm({ ...burialForm, deceased_age: text })}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Civil Status</Text>
        <Picker
          selectedValue={burialForm.deceased_civil_status || ''}
          onValueChange={(value) => setBurialForm({ ...burialForm, deceased_civil_status: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Status" value="" />
          <Picker.Item label="Single" value="Single" />
          <Picker.Item label="Married" value="Married" />
          <Picker.Item label="Widowed" value="Widowed" />
        </Picker>
      </View>

      <View style={styles.divider} />

      {/* Requester Information */}
      <Text style={styles.sectionHeader}>Requester Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Requested By *"
        value={burialForm.requested_by || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, requested_by: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Relationship to Deceased *"
        value={burialForm.deceased_relationship || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, deceased_relationship: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Address *"
        value={burialForm.address || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, address: text })}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number *"
        value={burialForm.contact_no || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, contact_no: text })}
        keyboardType="phone-pad"
      />

      <View style={styles.divider} />

      {/* Service Location */}
      <Text style={styles.sectionHeader}>Service Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Place of Mass *"
        value={burialForm.place_of_mass || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, place_of_mass: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Mass Address *"
        value={burialForm.mass_address || ''}
        onChangeText={(text) => setBurialForm({ ...burialForm, mass_address: text })}
        multiline
      />

      <View style={styles.divider} />

      {/* Service Options */}
      <Text style={styles.sectionHeader}>Select Funeral Services</Text>
      <View style={styles.servicesGrid}>
        <TouchableOpacity
          style={[
            styles.serviceCard,
            burialForm.funeral_mass && styles.serviceCardSelected
          ]}
          onPress={() => toggleService('funeral_mass')}
        >
          <Ionicons
            name={burialForm.funeral_mass ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={burialForm.funeral_mass ? "#007AFF" : "#666"}
          />
          <Text style={[
            styles.serviceText,
            burialForm.funeral_mass && styles.serviceTextSelected
          ]}>
            Funeral Mass
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.serviceCard,
            burialForm.death_anniversary && styles.serviceCardSelected
          ]}
          onPress={() => toggleService('death_anniversary')}
        >
          <Ionicons
            name={burialForm.death_anniversary ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={burialForm.death_anniversary ? "#007AFF" : "#666"}
          />
          <Text style={[
            styles.serviceText,
            burialForm.death_anniversary && styles.serviceTextSelected
          ]}>
            Death Anniversary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.serviceCard,
            burialForm.funeral_blessing && styles.serviceCardSelected
          ]}
          onPress={() => toggleService('funeral_blessing')}
        >
          <Ionicons
            name={burialForm.funeral_blessing ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={burialForm.funeral_blessing ? "#007AFF" : "#666"}
          />
          <Text style={[
            styles.serviceText,
            burialForm.funeral_blessing && styles.serviceTextSelected
          ]}>
            Funeral Blessing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.serviceCard,
            burialForm.tomb_blessing && styles.serviceCardSelected
          ]}
          onPress={() => toggleService('tomb_blessing')}
        >
          <Ionicons
            name={burialForm.tomb_blessing ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={burialForm.tomb_blessing ? "#007AFF" : "#666"}
          />
          <Text style={[
            styles.serviceText,
            burialForm.tomb_blessing && styles.serviceTextSelected
          ]}>
            Tomb Blessing
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
  },
  ageInput: {
    width: 80,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: '45%',
    gap: 8,
  },
  serviceCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  serviceTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default BurialDocuments;
