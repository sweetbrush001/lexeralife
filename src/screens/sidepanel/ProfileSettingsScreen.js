import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ProfileSettingsScreen() {
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load user data from storage or API
    loadUserData();
    
    // Request permissions for image picker
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
        }
      }
    })();
  }, []);

  const loadUserData = () => {
    // Simulating fetching user data
    setName('John Doe');
    setEmail('john.doe@example.com');
    setAge('32');
    setLocation('San Francisco, CA');
    // Default profile image could be set here
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Age validation
    if (age && (isNaN(parseInt(age)) || parseInt(age) < 6 || parseInt(age) > 120)) {
      Alert.alert('Error', 'Please enter a valid age between 6 and 120');
      return;
    }
    
    // Simulating API call
    setIsSaving(true);
    setTimeout(() => {
      // In a real app, you would save data to API or storage here
      setIsSaving(false);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    }, 1000);
  };

  const renderEditableField = (label, value, setValue, placeholder, keyboardType = 'default', multiline = false, icon) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.textInput, multiline && styles.multilineInput]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || `No ${label.toLowerCase()} set`}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Settings</Text>
          <TouchableOpacity 
            style={[styles.editButton, isEditing && styles.saveButtonColor]} 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Text style={styles.editButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color="#999" />
                </View>
              )}
              {isEditing && (
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.formContainer}>
            {renderEditableField('Name', name, setName, 'Enter your full name', 'default', false, 
              <Ionicons name="person-outline" size={20} color="#5c6bc0" />
            )}
            
            {renderEditableField('Email', email, setEmail, 'Enter your email address', 'email-address', false, 
              <Ionicons name="mail-outline" size={20} color="#5c6bc0" />
            )}
            
           
            
            {renderEditableField('Age', age, setAge, 'Enter your age', 'numeric', false, 
              <Ionicons name="calendar-outline" size={20} color="#5c6bc0" />
            )}
            
            {renderEditableField('Location', location, setLocation, 'Enter your location', 'default', false, 
              <Ionicons name="location-outline" size={20} color="#5c6bc0" />
            )}
            
           
            
            {isEditing && (
              <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.savingButton]} 
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" style={styles.saveIcon} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#5c6bc0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonColor: {
    backgroundColor: '#4caf50',
  },
  savingButton: {
    backgroundColor: '#9e9e9e',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    backgroundColor: '#f9f9f9',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaecef',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#5c6bc0',
  },
  profileImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e6e9f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#5c6bc0',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5c6bc0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  changePhotoButton: {
    marginTop: 12,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#5c6bc0',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eaecef',
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#5c6bc0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveIcon: {
    marginRight: 8,
  }
});