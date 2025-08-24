import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingListScreen from '../screens/BookingListScreen'; 
import RequestScreen from '../screens/RequestScreen';
import VirtualTourScreen from '../screens/VirtualTourScreen';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import CertificateRequestScreen from '../screens/CertificateRequestScreen';

const Tab = createBottomTabNavigator();
const BookingStack = createStackNavigator();
const HomeStack = createStackNavigator();

// Define the color scheme
const colors = {
  primary: '#E1D5B8', // Light Beige
  secondary: '#6B5F32', // Dark Brown
  background: '#f5f5f5', // Light Gray
  card: '#ffffff', // White
  accent: '#BE996E', // Tan
  button: '#AA722A', // Brown
  activeTint: '#6B5F32', // Active tab icon color
  inactiveTint: '#999999', // Inactive tab icon color
};

// Stack navigator for Home
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen 
        name="BookingList" 
        component={BookingListScreen}
        options={{ 
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

// Stack navigator for Bookings
function BookingStackNavigator() {
  return (
    <BookingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { color: colors.secondary, fontWeight: 'bold' },
        headerTintColor: colors.secondary,
        headerShadowVisible: false,
      }}
    >
      <BookingStack.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ title: 'Book a Sacrament' }}
      />
      <BookingStack.Screen 
        name="BookingList" 
        component={BookingListScreen}
        options={{ title: 'Your Bookings' }}
      />
      <BookingStack.Screen 
        name="Request" 
        component={RequestScreen}
        options={{ title: 'Request Certificates' }}
      />
    </BookingStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'VirtualTour') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.activeTint,
        tabBarInactiveTintColor: colors.inactiveTint,
        tabBarStyle: { 
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false, // Hide header for bottom tabs
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ title: 'Events' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingStackNavigator}
        options={{ title: 'Bookings' }}
      /> 
      <Tab.Screen 
        name="VirtualTour" 
        component={VirtualTourScreen}
        options={{ title: 'Virtual Tour' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
  