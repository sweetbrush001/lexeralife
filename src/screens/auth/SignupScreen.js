import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import OrbitLoader from '../../components/ui/OrbitLoader';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

// Scaling functions for responsive sizing
const scale = size => (width / 375) * size;

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace('AgeRangeSelector');
    } catch (error) {
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Text style={styles.title}>REGISTER</Text>
          
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitlePurple}>Create </Text>
            <Text style={styles.subtitleBlack}>your </Text>
            <Text style={styles.subtitleBlue}>new </Text>
            <Text style={styles.subtitleRed}>account</Text>
          </View>
          
          <View style={styles.inputsContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={scale(20)} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#777"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={scale(20)} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-Mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#777"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={scale(20)} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#777"
              />
              <TouchableOpacity 
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.visibilityIcon}
              >
                <Ionicons 
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={scale(20)} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={scale(20)} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="RE- Enter Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmPasswordVisible}
                placeholderTextColor="#777"
              />
              <TouchableOpacity 
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                style={styles.visibilityIcon}
              >
                <Ionicons 
                  name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={scale(20)} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={scale(18)} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.signupButtonContainer}
            onPress={handleSignup}
            disabled={loading}
          >
            <LinearGradient
              colors={['#5D44F8', '#4C3CD3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signupButton}
            >
              {loading ? (
                <OrbitLoader size={scale(24)} color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign up</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <AntDesign name="google" size={scale(28)} color="#DB4437" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={scale(28)} color="#4267B2" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <AntDesign name="apple1" size={scale(28)} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an Account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: scale(30),
    justifyContent: 'center',
  },
  title: {
    fontSize: scale(42),
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: scale(10),
    textAlign: 'center',
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scale(30),
  },
  subtitlePurple: {
    fontSize: scale(24),
    fontWeight: '600',
    color: '#8A2BE2',
  },
  subtitleBlack: {
    fontSize: scale(24),
    fontWeight: '600',
    color: '#000',
  },
  subtitleBlue: {
    fontSize: scale(24),
    fontWeight: '600',
    color: '#4169E1',
  },
  subtitleRed: {
    fontSize: scale(24),
    fontWeight: '600',
    color: '#E9667A',
  },
  inputsContainer: {
    marginBottom: scale(15),
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(15),
    paddingVertical: scale(4),
    paddingHorizontal: scale(15),
    marginBottom: scale(15),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: scale(10),
  },
  visibilityIcon: {
    padding: scale(5),
  },
  input: {
    flex: 1,
    fontSize: scale(16),
    paddingVertical: scale(10),
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: scale(10),
    borderRadius: scale(10),
    marginBottom: scale(15),
  },
  errorText: {
    color: '#ef4444',
    marginLeft: scale(8),
    fontSize: scale(14),
  },
  termsContainer: {
    marginBottom: scale(15),
  },
  termsText: {
    textAlign: 'center',
    color: '#333',
    fontSize: scale(13),
  },
  termsLink: {
    color: '#FF9500',
    fontWeight: '500',
  },
  signupButtonContainer: {
    borderRadius: scale(25),
    overflow: 'hidden',
    marginBottom: scale(20),
  },
  signupButton: {
    paddingVertical: scale(15),
    alignItems: 'center',
    borderRadius: scale(25),
  },
  signupButtonText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D3D3D3',
  },
  orText: {
    paddingHorizontal: scale(10),
    color: '#333',
    fontWeight: '600',
    fontSize: scale(16),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scale(25),
  },
  socialButton: {
    marginHorizontal: scale(15),
    width: scale(45),
    height: scale(45),
    borderRadius: scale(22.5),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: scale(16),
    color: '#333',
    marginBottom: scale(5),
  },
  loginLink: {
    fontSize: scale(22),
    color: '#E9667A',
    fontWeight: '500',
  },
});

export default SignupScreen;