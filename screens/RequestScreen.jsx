import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RequestScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [baptismCert, setBaptismCert] = useState(false);
  const [confirmationCert, setConfirmationCert] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('request_tbl')
        .select('*')
        .eq('user_id', user.id)
        .order('date_created', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch your requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!baptismCert && !confirmationCert) {
      Alert.alert('Error', 'Please select at least one certificate to request.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('request_tbl')
        .insert([
          {
            user_id: user.id,
            request_baptismcert: baptismCert,
            request_confirmationcert: confirmationCert,
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your certificate request has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setBaptismCert(false);
              setConfirmationCert(false);
              fetchRequests();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRequestItem = (request) => (
    <View key={request.id} style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestDate}>
          {new Date(request.date_created).toLocaleDateString()}
        </Text>
        <Text style={styles.requestStatus}>
          {request.date_updated === request.date_created ? 'Pending' : 'Processed'}
        </Text>
      </View>
      <View style={styles.certificateList}>
        {request.request_baptismcert && (
          <View style={styles.certificateItem}>
            <Ionicons name="document-text-outline" size={20} color="#007bff" />
            <Text style={styles.certificateText}>Baptism Certificate</Text>
          </View>
        )}
        {request.request_confirmationcert && (
          <View style={styles.certificateItem}>
            <Ionicons name="document-text-outline" size={20} color="#007bff" />
            <Text style={styles.certificateText}>Confirmation Certificate</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Request Certificates</Text>

        <View style={styles.formContainer}>
          <TouchableOpacity
            style={[styles.certificateOption, baptismCert && styles.selectedOption]}
            onPress={() => setBaptismCert(!baptismCert)}
          >
            <Ionicons
              name={baptismCert ? 'checkbox' : 'square-outline'}
              size={24}
              color={baptismCert ? '#007bff' : '#666'}
            />
            <Text style={styles.optionText}>Baptism Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.certificateOption, confirmationCert && styles.selectedOption]}
            onPress={() => setConfirmationCert(!confirmationCert)}
          >
            <Ionicons
              name={confirmationCert ? 'checkbox' : 'square-outline'}
              size={24}
              color={confirmationCert ? '#007bff' : '#666'}
            />
            <Text style={styles.optionText}>Confirmation Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, loading && styles.buttonDisabled]}
            onPress={handleRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.buttonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.requestsContainer}>
          <Text style={styles.sectionTitle}>Your Requests</Text>
          {requests.length > 0 ? (
            requests.map(renderRequestItem)
          ) : (
            <Text style={styles.noRequestsText}>No requests yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  certificateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  requestsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  requestItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  requestStatus: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  certificateList: {
    marginTop: 5,
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  certificateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  noRequestsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
}); 