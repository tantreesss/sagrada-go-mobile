import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, Dimensions, Modal 
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function BookingListScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('booking_tbl')
          .select('*')
          .eq('user_id', user.id)
          .order('date_created', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${booking.booking_sacrament} booking?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('booking_tbl')
                .update({ booking_status: 'cancelled' })
                .eq('id', booking.id);

              if (error) throw error;

              Alert.alert('Success', 'Booking cancelled successfully.');
              fetchBookings(); // Refresh the list
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.booking_status === filter;
  });

  const getFilterCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(booking => booking.booking_status === status).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6B5F32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterTab,
                filter === filterOption.key && styles.activeFilterTab
              ]}
              onPress={() => setFilter(filterOption.key)}
            >
              <Text style={[
                styles.filterTabText,
                filter === filterOption.key && styles.activeFilterTabText
              ]}>
                {filterOption.label} ({getFilterCount(filterOption.key)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.bookingsContainer}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`
              }
            </Text>
            {filter === 'all' && (
              <TouchableOpacity 
                style={styles.newBookingButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.newBookingButtonText}>Make Your First Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => {
                setSelectedBooking(booking);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.booking_sacrament}</Text>
                  <Text style={styles.bookingDate}>
                    {formatDate(booking.booking_date)} at {booking.booking_time}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.booking_status) }]}>
                  <Ionicons 
                    name={getStatusIcon(booking.booking_status)} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.statusText}>{getStatusText(booking.booking_status)}</Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.detailText}>{booking.booking_pax} people</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="card" size={16} color="#666" />
                  <Text style={styles.detailText}>₱{booking.price?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Booked on {formatDateTime(booking.date_created)}
                  </Text>
                </View>
              </View>

              {booking.booking_status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelBooking(booking)}
                >
                  <Ionicons name="close" size={16} color="#F44336" />
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Sacrament</Text>
                  <Text style={styles.sectionValue}>{selectedBooking.booking_sacrament}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Date & Time</Text>
                  <Text style={styles.sectionValue}>
                    {formatDate(selectedBooking.booking_date)} at {selectedBooking.booking_time}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Number of People</Text>
                  <Text style={styles.sectionValue}>{selectedBooking.booking_pax} people</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Price</Text>
                  <Text style={styles.sectionValue}>₱{selectedBooking.price?.toLocaleString() || '0'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.booking_status) }]}>
                      <Ionicons 
                        name={getStatusIcon(selectedBooking.booking_status)} 
                        size={16} 
                        color="white" 
                      />
                      <Text style={styles.statusText}>{getStatusText(selectedBooking.booking_status)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Transaction ID</Text>
                  <Text style={styles.sectionValue}>{selectedBooking.booking_transaction}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Booked On</Text>
                  <Text style={styles.sectionValue}>{formatDateTime(selectedBooking.date_created)}</Text>
                </View>

                {selectedBooking.booking_status === 'pending' && (
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleCancelBooking(selectedBooking);
                    }}
                  >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.modalCancelButtonText}>Cancel This Booking</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#E1D5B8',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5F32',
  },
  placeholder: {
    width: 34,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilterTab: {
    backgroundColor: '#E1D5B8',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#6B5F32',
    fontWeight: '600',
  },
  bookingsContainer: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  newBookingButton: {
    backgroundColor: '#E1D5B8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newBookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 10,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width - 40,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5F32',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  sectionValue: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  modalCancelButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
