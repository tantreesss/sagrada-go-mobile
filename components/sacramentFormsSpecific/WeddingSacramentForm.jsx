import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

const WeddingSacramentForm = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  const renderImage = (imageUrl, title) => {
    if (!imageUrl) {
      return (
        <View style={styles.noImageCard}>
          <Text style={styles.noImageText}>No {title} Available</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.imageCard}
        onPress={() => {
          // In a real app, you might want to open the image in a full-screen viewer
          Alert.alert('Image', `${title} - Tap to view full size`);
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.documentImage} />
        <Text style={styles.imageCaption}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Wedding Documentation</Text>
      
      <View style={styles.divider} />

      {/* Couple Information */}
      <Text style={styles.sectionTitle}>Couple Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Groom Full Name:</Text>
          <Text style={styles.infoValue}>{data?.groom_fullname || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bride Full Name:</Text>
          <Text style={styles.infoValue}>{data?.bride_fullname || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contact Number:</Text>
          <Text style={styles.infoValue}>{data?.contact_no || 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.imageNote}>
        Tap on the images to view them in full size.
      </Text>
      <View style={styles.divider} />

      {/* Profile Pictures */}
      <Text style={styles.sectionTitle}>Profile Pictures (1x1)</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom Photo</Text>
          {renderImage(data?.groom_1x1, "Groom 1x1 Photo")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride Photo</Text>
          {renderImage(data?.bride_1x1, "Bride 1x1 Photo")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Baptismal Certificates */}
      <Text style={styles.sectionTitle}>Baptismal Certificates</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom Baptismal Certificate</Text>
          {renderImage(data?.groom_baptismal_cert, "Groom Baptismal Certificate")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride Baptismal Certificate</Text>
          {renderImage(data?.bride_baptismal_cert, "Bride Baptismal Certificate")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Confirmation Certificates */}
      <Text style={styles.sectionTitle}>Confirmation Certificates</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom Confirmation Certificate</Text>
          {renderImage(data?.groom_confirmation_cert, "Groom Confirmation Certificate")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride Confirmation Certificate</Text>
          {renderImage(data?.bride_confirmation_cert, "Bride Confirmation Certificate")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Legal Documents */}
      <Text style={styles.sectionTitle}>Legal Documents</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Marriage License</Text>
          {renderImage(data?.marriage_license, "Marriage License")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Marriage Contract</Text>
          {renderImage(data?.marriage_contract, "Marriage Contract")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* CENOMAR Documents */}
      <Text style={styles.sectionTitle}>CENOMAR</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom CENOMAR</Text>
          {renderImage(data?.groom_cenomar, "Groom CENOMAR")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride CENOMAR</Text>
          {renderImage(data?.bride_cenomar, "Bride CENOMAR")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Banns Documents */}
      <Text style={styles.sectionTitle}>Banns of Marriage</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom Banns</Text>
          {renderImage(data?.groom_banns, "Groom Banns")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride Banns</Text>
          {renderImage(data?.bride_banns, "Bride Banns")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Permission Documents */}
      <Text style={styles.sectionTitle}>Permission Documents</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Groom Permission</Text>
          {renderImage(data?.groom_permission, "Groom Permission")}
        </View>
        <View style={styles.imageColumn}>
          <Text style={styles.imageTitle}>Bride Permission</Text>
          {renderImage(data?.bride_permission, "Bride Permission")}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Record Info */}
      <View style={styles.certificateInfo}>
        <Text style={styles.certificateText}>
          Record ID: {data?.id || 'N/A'}
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
  imageNote: {
    fontSize: 14,
    color: '#6B5F32',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  imageColumn: {
    flex: 1,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B5F32',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageCard: {
    borderWidth: 1,
    borderColor: '#E1D5B8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  documentImage: {
    height: 200,
    width: '100%',
    resizeMode: 'cover',
  },
  imageCaption: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  noImageCard: {
    borderWidth: 1,
    borderColor: '#E1D5B8',
    borderRadius: 8,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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

export default WeddingSacramentForm;
