import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { db, auth, storage } from '../../../config/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Import useTextStyle hook
import { useTextStyle } from '../../../hooks/useTextStyle';

const CreatePost = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [currentUser, setCurrentUser] = useState({
    displayName: 'Anonymous',
    photoURL: null
  });
  
  // Get text style settings and extract just the font family
  const textStyleSettings = useTextStyle();
  const fontStyle = useMemo(() => {
    const { fontFamily } = textStyleSettings;
    return { fontFamily };
  }, [textStyleSettings]);
  
  const contentInputRef = useRef(null);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUser({
        displayName: auth.currentUser.displayName || 'Anonymous',
        photoURL: auth.currentUser.photoURL
      });
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
        }
      }
    })();
  }, [fadeAnim, slideAnim]);
  
  const handleContentChange = (text) => {
    setContent(text);
    setCharCount(text.length);
  };
  
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const removeImage = () => {
    setImage(null);
  };
  
  const uploadImage = async () => {
    if (!image) return null;
    
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      
      const fileExtension = image.split('.').pop();
      const fileName = `post_images/${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw new Error('Failed to upload image');
    }
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please write some content for your post');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const imageUrl = image ? await uploadImage() : null;
      
      // Use email as the author for the post
      const authorEmail = auth.currentUser.email;
  
      await addDoc(collection(db, 'communityPosts'), {
        title: title.trim(),
        content: content.trim(),
        author: authorEmail,  // Save the email here
        avatar: currentUser.photoURL,
        timestamp: serverTimestamp(),
        imageUrl,
        likes: 0,
        comments: []
      });
      
      Alert.alert(
        'Success', 
        'Your post has been published!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }]
      );
    } catch (error) {
      console.error("Error publishing post: ", error);
      Alert.alert(
        'Error', 
        'Failed to publish your post. Please try again.',
        [{ text: 'OK' }]
      );
      setSubmitting(false);
    }
  };
  
  
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fontStyle]}>Create Post</Text>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            (!title.trim() || !content.trim() || submitting) && styles.postButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.postButtonText, fontStyle]}>Publish</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.userInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Image 
              source={{ 
                uri: currentUser.photoURL || 'https://placeimg.com/80/80/people' 
              }} 
              style={styles.userAvatar} 
            />
            <Text style={[styles.userName, fontStyle]}>{currentUser.displayName}</Text>
          </Animated.View>
          
          <Animated.View style={{ opacity: fadeAnim }}>
            <TextInput 
              style={[styles.titleInput, fontStyle]} 
              placeholder="Write an engaging title..." 
              placeholderTextColor="#999"
              value={title} 
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
              onSubmitEditing={() => contentInputRef.current?.focus()}
            />
            
            <TextInput 
              ref={contentInputRef}
              style={[styles.contentInput, fontStyle]} 
              placeholder="Share your thoughts..." 
              placeholderTextColor="#999"
              value={content} 
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            
            <Text style={[styles.charCounter, fontStyle]}>
              {charCount}/2000 characters
            </Text>
            
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={removeImage}
                >
                  <Icon name="times-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Animated.View 
        style={[
          styles.toolbar,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.toolbarButton} 
          onPress={pickImage}
        >
          <Icon name="image" size={20} color="#0066FF" />
          <Text style={[styles.toolbarText, fontStyle]}>Add Image</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="poll" size={20} color="#0066FF" />
          <Text style={[styles.toolbarText, fontStyle]}>Create Poll</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="map-marker-alt" size={20} color="#0066FF" />
          <Text style={[styles.toolbarText, fontStyle]}>Add Location</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  postButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  postButtonDisabled: {
    backgroundColor: '#99c2ff',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 0,
    color: '#1a1a1a',
    lineHeight: 32,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
    color: '#4a4a4a',
  },
  charCounter: {
    alignSelf: 'flex-end',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  toolbarText: {
    marginLeft: 8,
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CreatePost;