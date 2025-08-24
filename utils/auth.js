import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (userData) => {
    // Simulate login by storing the user data in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData));
};
  
export const logoutUser = async () => {
    // Clear user data from AsyncStorage
    await AsyncStorage.removeItem('user');
};
  
export const isUserLoggedIn = async () => {
    // Check if user data exists in AsyncStorage
    const user = await AsyncStorage.getItem('user');
    return user !== null;
};
  
export const getUser = async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
