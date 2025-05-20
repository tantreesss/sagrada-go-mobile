import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingListScreen from '../screens/BookingListScreen'; 
import VirtualTourScreen from '../screens/VirtualTourScreen';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const Tab = createBottomTabNavigator();
const BookingStack = createStackNavigator();

// Define the color scheme
const colors = {
  primary: '#738054', // Dark Olive Green
  secondary: '#A3A86D', // Olive
  background: '#E1D5B8', // Light Beige
  card: '#D6C7A7', // Beige
  accent: '#BE996E', // Tan
  button: '#AA722A', // Brown
  activeTint: '#AA722A', // Active tab icon color
  inactiveTint: '#738054', // Inactive tab icon color
};

// Stack navigator for Bookings
function BookingStackNavigator() {
  return (
    <BookingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { color: '#fff' },
        headerTintColor: '#fff',
      }}
    >
      <BookingStack.Screen name="Booking" component={BookingScreen} />
      <BookingStack.Screen name="BookingList" component={BookingListScreen} />
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
          } else if (route.name === 'Virtual Tour') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.activeTint,
        tabBarInactiveTintColor: colors.inactiveTint,
        tabBarStyle: { backgroundColor: colors.card }, // Tab bar background
        headerShown: false, // Hide header for bottom tabs
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Bookings" component={BookingStackNavigator} /> 
      <Tab.Screen name="Virtual Tour" component={VirtualTourScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
  