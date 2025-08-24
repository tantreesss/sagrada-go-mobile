import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const BurialSacramentForm = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  const renderBooleanStatus = (value, label) => {
    const isTrue = value === true || value === 'true';
    return (
      <View style={styles.statusItem}>
        <Text style={styles.statusLabel}>{label}:</Text>
        <Text style={[
          styles.statusValue,
          isTrue ? styles.statusYes : styles.statusNo
        ]}>
          {isTrue ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Burial Service Details</Text>
      
      <View style={styles.divider} />

      {/* Deceased Information */}
      <Text style={styles.sectionTitle}>Deceased Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{data?.deceased_name || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{data?.deceased_age || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Civil Status:</Text>
          <Text style={styles.infoValue}>{data?.deceased_civil_status || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Requester Information */}
      <Text style={styles.sectionTitle}>Requester Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Requested By:</Text>
          <Text style={styles.infoValue}>{data?.requested_by || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Relationship to Deceased:</Text>
          <Text style={styles.infoValue}>{data?.deceased_relationship || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contact Number:</Text>
          <Text style={styles.infoValue}>{data?.contact_no || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{data?.address || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Service Location */}
      <Text style={styles.sectionTitle}>Service Location</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Place of Mass:</Text>
          <Text style={styles.infoValue}>{data?.place_of_mass || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Mass Address:</Text>
          <Text style={styles.infoValue}>{data?.mass_address || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Service Options */}
      <Text style={styles.sectionTitle}>Requested Services</Text>
      <View style={styles.servicesGrid}>
        <View style={styles.servicesColumn}>
          {renderBooleanStatus(data?.funeral_mass, 'Funeral Mass')}
          {renderBooleanStatus(data?.death_anniversary, 'Death Anniversary')}
        </View>
        <View style={styles.servicesColumn}>
          {renderBooleanStatus(data?.funeral_blessing, 'Funeral Blessing')}
          {renderBooleanStatus(data?.tomb_blessing, 'Tomb Blessing')}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Certificate Info */}
      <View style={styles.certificateInfo}>
        <Text style={styles.certificateText}>
          Service ID: {data?.id || 'N/A'}
        </Text>
        <Text style={styles.certificateText}>
          Date Created: {formatDate(data?.date_created)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B5F32',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#6B5F32',
    marginVertical: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#555',
  },
  servicesGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  servicesColumn: {
    flex: 1,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusYes: {
    color: '#4CAF50',
  },
  statusNo: {
    color: '#F44336',
  },
  certificateInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  certificateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

export default BurialSacramentForm;
