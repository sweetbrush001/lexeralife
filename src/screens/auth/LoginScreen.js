import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { auth } from '../../config/firebaseConfig'; // Import the auth instance
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signIn function
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for persistence
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Sign in with email and password using Firebase Auth
      await signInWithEmailAndPassword(auth, username, password);

      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [username, password, navigation]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Gradient */}
      <LinearGradient colors={['#89A69A', '#D2C599']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <View style={styles.form}>
            
            {/* Header Image */}
            <View style={styles.headerImageContainer}>
              <Image source={require('../../../assets/login_back.png')} style={styles.headerImage} resizeMode="contain" />
            </View>

            {/* Login Text */}
            <Text style={styles.loginText}>LOGIN</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={24} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={24} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#666"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Loading...' : 'Login Now'}
              </Text>
            </TouchableOpacity>

            {/* Login with Others */}
            <Text style={styles.loginWithText}>
              <Text style={styles.loginPart}>Login</Text>
              <Text style={styles.withOthersPart}> with Others</Text>
            </Text>

            {/* Social Login (Only Google) */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <AntDesign name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
            </View>

            {/* Create Account */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.noAccountText}>Don't have an Account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.createAccountText}>Create Account</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  headerImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerImage: {
    width: 650, // Adjust width as needed
    height: 250, // Adjust height as needed
    marginTop: -60,
  },
  loginText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 20,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#6200EE',
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  loginButton: {
    width: width * 0.4,
    height: 50,
    backgroundColor: '#6200EE',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginWithText: {
    marginTop: 30,
    fontSize: 18,
    marginBottom: 20,
  },
  loginPart: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  withOthersPart: {
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  createAccountContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  createAccountText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});

export default LoginScreen;
