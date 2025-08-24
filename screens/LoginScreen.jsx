import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { globalStyles } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LoginScreen({ navigation }) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    user_firstname: '',
    user_middle: '',
    user_lastname: '',
    user_gender: 'rather not to tell',
    user_status: '-',
    user_mobile: '',
    user_bday: null,
    user_email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!loginData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await signIn(loginData.email, loginData.password);
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Validate required fields
    if (!signupData.user_firstname || !signupData.user_lastname || !signupData.user_mobile || 
        !signupData.user_bday || !signupData.user_email || !signupData.password || !signupData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.user_email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Password validation
    if (signupData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Mobile number validation
    if (!/^\d+$/.test(signupData.user_mobile)) {
      Alert.alert('Error', 'Mobile number must contain only numbers.');
      return;
    }
    if (!signupData.user_mobile.startsWith('09') || signupData.user_mobile.length !== 11) {
      Alert.alert('Error', 'Mobile number must be 11 digits long and start with 09.');
      return;
    }

    // Age validation
    const today = new Date();
    const birthDate = new Date(signupData.user_bday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
      Alert.alert('Error', 'You must be at least 18 years old to register.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(signupData);
      Alert.alert(
        'Account Created', 
        result.message || 'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => setIsLogin(true)
          }
        ]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSignupData({...signupData, user_bday: selectedDate});
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sagrada Go</Text>
          <Text style={styles.subtitle}>Parish Management System</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {isLogin ? (
            // Login Form
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={loginData.email}
                  onChangeText={(text) => setLoginData({...loginData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={loginData.password}
                  onChangeText={(text) => setLoginData({...loginData, password: text})}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => Alert.alert('Forgot Password', 'Please contact the parish office to reset your password.')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Signup Form
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name *"
                    value={signupData.user_firstname}
                    onChangeText={(text) => setSignupData({...signupData, user_firstname: text})}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name *"
                    value={signupData.user_lastname}
                    onChangeText={(text) => setSignupData({...signupData, user_lastname: text})}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Middle Name (Optional)"
                  value={signupData.user_middle}
                  onChangeText={(text) => setSignupData({...signupData, user_middle: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  value={signupData.user_email}
                  onChangeText={(text) => setSignupData({...signupData, user_email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number (09XXXXXXXXX) *"
                  value={signupData.user_mobile}
                  onChangeText={(text) => setSignupData({...signupData, user_mobile: text})}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

                             <View style={styles.inputContainer}>
                 <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                 <TouchableOpacity
                   style={styles.dateInput}
                   onPress={showDatePickerModal}
                 >
                   <Text style={signupData.user_bday ? styles.dateText : styles.placeholderText}>
                     {signupData.user_bday ? formatDate(signupData.user_bday) : 'Birth Date *'}
                   </Text>
                 </TouchableOpacity>
               </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  value={signupData.password}
                  onChangeText={(text) => setSignupData({...signupData, password: text})}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Password must be at least 6 characters with uppercase, lowercase, and numbers
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  value={signupData.confirmPassword}
                  onChangeText={(text) => setSignupData({...signupData, confirmPassword: text})}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
                     )}
         </View>
       </ScrollView>

       {/* Date Picker Modal */}
       {showDatePicker && (
         <DateTimePicker
           value={signupData.user_bday || new Date()}
           mode="date"
           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
           onChange={handleDateChange}
           maximumDate={new Date()}
           minimumDate={new Date(1900, 0, 1)}
         />
       )}
     </KeyboardAvoidingView>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B5F32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E1D5B8',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#6B5F32',
  },
  form: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  halfWidth: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#E1D5B8',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#E1D5B8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  passwordHint: {
    color: '#666',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
    fontStyle: 'italic',
  },
});
