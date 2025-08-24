import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const BaptismDocuments = ({ baptismForm, setBaptismForm }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('');

  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBaptismForm(prev => ({
        ...prev,
        [field]: selectedDate
      }));
    }
  };

  const showDatePickerModal = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const addGodparent = () => {
    if ((baptismForm.additional_godparents?.length || 0) < 10) {
      setBaptismForm(prev => ({
        ...prev,
        additional_godparents: [
          ...(prev.additional_godparents || []),
          {
            godfather_name: '',
            godfather_age: '',
            godmother_name: '',
            godmother_age: ''
          }
        ]
      }));
    }
  };

  const removeGodparent = (index) => {
    setBaptismForm(prev => ({
      ...prev,
      additional_godparents: prev.additional_godparents.filter((_, i) => i !== index)
    }));
  };

  const updateGodparent = (index, field, value) => {
    setBaptismForm(prev => {
      const updated = [...prev.additional_godparents];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additional_godparents: updated };
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>For baptism, please ensure you have the necessary information.</Text>
      
      {/* Baby's Information */}
      <Text style={styles.sectionHeader}>Baby's Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Baby's Fullname *"
        value={baptismForm.baby_name || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, baby_name: text })}
      />
      
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => showDatePickerModal('baby_bday')}
      >
        <Text style={styles.dateButtonText}>
          {baptismForm.baby_bday ? 
            baptismForm.baby_bday.toLocaleDateString() : 
            'Baby\'s Birthday *'
          }
        </Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Baby's Birthplace *"
        value={baptismForm.baby_birthplace || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, baby_birthplace: text })}
      />

      {/* Mother's Information */}
      <Text style={styles.sectionHeader}>Mother's Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Mother's Fullname *"
        value={baptismForm.mother_name || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, mother_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Mother's Birthplace *"
        value={baptismForm.mother_birthplace || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, mother_birthplace: text })}
      />

      {/* Father's Information */}
      <Text style={styles.sectionHeader}>Father's Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Father's Fullname *"
        value={baptismForm.father_name || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, father_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Father's Birthplace *"
        value={baptismForm.father_birthplace || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, father_birthplace: text })}
      />

      <View style={styles.divider} />

      {/* Marriage Type */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Type of Marriage</Text>
        <Picker
          selectedValue={baptismForm.marriage_type || ''}
          onValueChange={(value) => setBaptismForm({ ...baptismForm, marriage_type: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Type" value="" />
          <Picker.Item label="Catholic" value="Catholic" />
          <Picker.Item label="Civil" value="Civil" />
          <Picker.Item label="Natural" value="Natural" />
          <Picker.Item label="Not Married" value="Not Married" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Contact Number *"
        value={baptismForm.contact_no || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, contact_no: text })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Current Address *"
        value={baptismForm.current_address || ''}
        onChangeText={(text) => setBaptismForm({ ...baptismForm, current_address: text })}
        multiline
      />

      <View style={styles.divider} />

      {/* Main Godparents */}
      <Text style={styles.sectionHeader}>Main Godparents</Text>
      
      <Text style={styles.subHeader}>Main Godfather</Text>
      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Fullname *"
        value={baptismForm.main_godfather?.name || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godfather: { ...baptismForm.main_godfather, name: text }
        })}
      />
      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Age *"
        value={baptismForm.main_godfather?.age || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godfather: { ...baptismForm.main_godfather, age: text }
        })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Main Godfather's Address *"
        value={baptismForm.main_godfather?.address || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godfather: { ...baptismForm.main_godfather, address: text }
        })}
        multiline
      />

      <Text style={styles.subHeader}>Main Godmother</Text>
      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Fullname *"
        value={baptismForm.main_godmother?.name || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godmother: { ...baptismForm.main_godmother, name: text }
        })}
      />
      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Age *"
        value={baptismForm.main_godmother?.age || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godmother: { ...baptismForm.main_godmother, age: text }
        })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Main Godmother's Address *"
        value={baptismForm.main_godmother?.address || ''}
        onChangeText={(text) => setBaptismForm({
          ...baptismForm,
          main_godmother: { ...baptismForm.main_godmother, address: text }
        })}
        multiline
      />

      <View style={styles.divider} />

      {/* Additional Godparents */}
      <View style={styles.addGodparentSection}>
        <Text style={styles.sectionHeader}>
          Additional GodParents ({(baptismForm.additional_godparents?.length || 0)}/10)
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addGodparent}
          disabled={(baptismForm.additional_godparents?.length || 0) >= 10}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {baptismForm.additional_godparents?.map((godparent, index) => (
        <View key={index} style={styles.godparentCard}>
          <View style={styles.godparentHeader}>
            <Text style={styles.godparentTitle}>Additional Godparent #{index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeGodparent(index)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subHeader}>Godfather</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flexInput]}
              placeholder="Godfather's Fullname"
              value={godparent.godfather_name}
              onChangeText={(text) => updateGodparent(index, 'godfather_name', text)}
            />
            <TextInput
              style={[styles.input, styles.ageInput]}
              placeholder="Age"
              value={godparent.godfather_age}
              onChangeText={(text) => updateGodparent(index, 'godfather_age', text)}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.subHeader}>Godmother</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flexInput]}
              placeholder="Godmother's Fullname"
              value={godparent.godmother_name}
              onChangeText={(text) => updateGodparent(index, 'godmother_name', text)}
            />
            <TextInput
              style={[styles.input, styles.ageInput]}
              placeholder="Age"
              value={godparent.godmother_age}
              onChangeText={(text) => updateGodparent(index, 'godmother_age', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}

      {showDatePicker && (
        <DateTimePicker
          value={baptismForm[datePickerField] || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, datePickerField)}
        />
      )}
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
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
    marginBottom: 8,
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
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
  addGodparentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
  },
  godparentCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  godparentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  godparentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 4,
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
});

export default BaptismDocuments;
