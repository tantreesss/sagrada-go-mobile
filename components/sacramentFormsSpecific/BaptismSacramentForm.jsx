import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BaptismSacramentForm = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  const renderGodparent = (godparent, title) => {
    if (!godparent || typeof godparent !== 'object') return null;
    return (
      <View style={styles.godparentCard}>
        <Text style={styles.godparentTitle}>{title}</Text>
        <Text style={styles.godparentInfo}>
          <Text style={styles.label}>Name:</Text> {godparent.name || 'N/A'}
        </Text>
        <Text style={styles.godparentInfo}>
          <Text style={styles.label}>Age:</Text> {godparent.age || 'N/A'}
        </Text>
        <Text style={styles.godparentInfo}>
          <Text style={styles.label}>Address:</Text> {godparent.address || 'N/A'}
        </Text>
      </View>
    );
  };

  const renderAdditionalGodparents = (godparents, title) => {
    if (!Array.isArray(godparents) || godparents.length === 0) {
      return <Text style={styles.noDataText}>None</Text>;
    }

    return (
      <View style={styles.additionalGodparents}>
        {godparents.map((godparent, index) => (
          <View key={index} style={styles.additionalGodparentItem}>
            <Ionicons name="person" size={16} color="#6B5F32" style={styles.personIcon} />
            <Text style={styles.additionalGodparentText}>
              {godparent.name} (Age: {godparent.age || 'N/A'})
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Baptism Details</Text>
      
      <View style={styles.divider} />

      {/* Child Information */}
      <Text style={styles.sectionTitle}>Child Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name:</Text>
          <Text style={styles.infoValue}>{data?.baby_name || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date of Birth:</Text>
          <Text style={styles.infoValue}>{formatDate(data?.baby_bday)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Place of Birth:</Text>
          <Text style={styles.infoValue}>{data?.baby_birthplace || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Parents Information */}
      <Text style={styles.sectionTitle}>Parents Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Mother's Name:</Text>
          <Text style={styles.infoValue}>{data?.mother_name || 'N/A'}</Text>
          <Text style={styles.subInfo}>
            <Text style={styles.subLabel}>Birthplace:</Text> {data?.mother_birthplace || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Father's Name:</Text>
          <Text style={styles.infoValue}>{data?.father_name || 'N/A'}</Text>
          <Text style={styles.subInfo}>
            <Text style={styles.subLabel}>Birthplace:</Text> {data?.father_birthplace || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Marriage Type:</Text>
          <Text style={styles.infoValue}>{data?.marriage_type || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contact Number:</Text>
          <Text style={styles.infoValue}>{data?.contact_no || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Address:</Text>
          <Text style={styles.infoValue}>{data?.current_address || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Main Godparents */}
      <Text style={styles.sectionTitle}>Principal Godparents</Text>
      <View style={styles.godparentsGrid}>
        {renderGodparent(data?.main_godfather, 'Main Godfather')}
        {renderGodparent(data?.main_godmother, 'Main Godmother')}
      </View>

      <View style={styles.divider} />

      {/* Additional Godparents */}
      <Text style={styles.sectionTitle}>Additional Godparents</Text>
      <View style={styles.additionalGodparentsSection}>
        <View style={styles.additionalGodparentsColumn}>
          <Text style={styles.columnTitle}>Additional Godfathers</Text>
          {renderAdditionalGodparents(data?.additional_godfathers, 'Godfather')}
        </View>
        
        <View style={styles.additionalGodparentsColumn}>
          <Text style={styles.columnTitle}>Additional Godmothers</Text>
          {renderAdditionalGodparents(data?.additional_godmothers, 'Godmother')}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Certificate Info */}
      <View style={styles.certificateInfo}>
        <Text style={styles.certificateText}>
          ID: {data?.id || 'N/A'}
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
  subInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subLabel: {
    fontWeight: '600',
  },
  godparentsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  godparentCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1D5B8',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  godparentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 8,
  },
  godparentInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
  },
  additionalGodparentsSection: {
    flexDirection: 'row',
    gap: 16,
  },
  additionalGodparentsColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B5F32',
    marginBottom: 8,
  },
  additionalGodparents: {
    gap: 8,
  },
  additionalGodparentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  personIcon: {
    marginRight: 8,
  },
  additionalGodparentText: {
    fontSize: 14,
    color: '#555',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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

export default BaptismSacramentForm;
