import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const VirtualTourScreen = () => {
  const navigation = useNavigation();
  const [currentView, setCurrentView] = useState('altar');

  const tourViews = {
    altar: {
      title: 'Main Altar',
      description: 'The sacred heart of our church where the Eucharist is celebrated.',
      image: require('../assets/360altar.jpg'),
      hotspots: [
        { name: 'Altar Table', description: 'The main altar where Mass is celebrated' },
        { name: 'Tabernacle', description: 'Where the Blessed Sacrament is reserved' },
        { name: 'Crucifix', description: 'Symbol of Christ\'s sacrifice' },
      ]
    },
    // Add more views as needed
  };

  const handleHotspotPress = (hotspot) => {
    Alert.alert(hotspot.name, hotspot.description);
  };

  const renderHotspots = () => {
    const currentViewData = tourViews[currentView];
    if (!currentViewData?.hotspots) return null;

    return (
      <View style={styles.hotspotsContainer}>
        <Text style={styles.hotspotsTitle}>Interactive Points:</Text>
        {currentViewData.hotspots.map((hotspot, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hotspotButton}
            onPress={() => handleHotspotPress(hotspot)}
          >
            <Ionicons name="location" size={20} color="#E1D5B8" />
            <Text style={styles.hotspotText}>{hotspot.name}</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E1D5B8" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Tour of Sagrada Familia Parish</Text>
      </View>

      {/* Panorama Container */}
      <View style={styles.panoramaContainer}>
        <Image
          source={tourViews[currentView].image}
          style={styles.panoramaImage}
          resizeMode="cover"
        />
        <View style={styles.panoramaOverlay}>
          <Text style={styles.panoramaTitle}>{tourViews[currentView].title}</Text>
          <Text style={styles.panoramaDescription}>
            {tourViews[currentView].description}
          </Text>
        </View>
      </View>

      {/* Tour Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>Tour Controls:</Text>
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="hand-left" size={20} color="#E1D5B8" />
            <Text style={styles.controlText}>Drag to look around</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="search" size={20} color="#E1D5B8" />
            <Text style={styles.controlText}>Pinch to zoom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="expand" size={20} color="#E1D5B8" />
            <Text style={styles.controlText}>Fullscreen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Hotspots */}
      {renderHotspots()}

      {/* Tour Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Welcome to Our Virtual Tour</Text>
        <Text style={styles.infoDescription}>
          Experience the beauty and serenity of Sagrada Familia Parish through our interactive virtual tour.
          Take your time to explore the sacred space and discover its architectural wonders.
        </Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tour Tips:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#E1D5B8" />
              <Text style={styles.tipText}>Take your time to appreciate the details</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#E1D5B8" />
              <Text style={styles.tipText}>Explore different angles and perspectives</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#E1D5B8" />
              <Text style={styles.tipText}>Learn about the history and significance</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#E1D5B8" />
              <Text style={styles.tipText}>Feel the spiritual atmosphere</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation to Other Views */}
      <View style={styles.navigationContainer}>
        <Text style={styles.navigationTitle}>Explore More Areas:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navigationScroll}>
          <TouchableOpacity
            style={[styles.navButton, currentView === 'altar' && styles.navButtonActive]}
            onPress={() => setCurrentView('altar')}
          >
            <Text style={[styles.navButtonText, currentView === 'altar' && styles.navButtonTextActive]}>
              Main Altar
            </Text>
          </TouchableOpacity>
          {/* Add more navigation buttons for other areas */}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#6B5F32',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#E1D5B8',
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#E1D5B8',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  panoramaContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  panoramaImage: {
    width: '100%',
    height: '100%',
  },
  panoramaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  panoramaTitle: {
    color: '#E1D5B8',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  panoramaDescription: {
    color: '#fff',
    fontSize: 14,
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  hotspotsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  hotspotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hotspotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  hotspotText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  navigationContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  navigationScroll: {
    flexDirection: 'row',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  navButtonActive: {
    backgroundColor: '#E1D5B8',
  },
  navButtonText: {
    fontSize: 14,
    color: '#666',
  },
  navButtonTextActive: {
    color: '#333',
    fontWeight: '600',
  },
});

export default VirtualTourScreen;