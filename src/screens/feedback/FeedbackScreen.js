import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebaseConfig';
import TTSVoiceButton from '../../components/TTSVoiceButton';
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';
// Import useTextStyle hook
import { useTextStyle } from '../../hooks/useTextStyle';

const categories = [
  'App Features',
  'User Experience',
  'Bug Report',
  'Suggestion',
  'Dyslexia Support',
  'Other'
];

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get text style settings and extract just the font family
  const textStyleSettings = useTextStyle();
  const fontStyle = useMemo(() => {
    const { fontFamily } = textStyleSettings;
    return { fontFamily };
  }, [textStyleSettings]);

  const handleSubmit = async () => {
    // Validate form
    if (selectedCategory === '') {
      Alert.alert('Missing Information', 'Please select a category for your feedback.');
      return;
    }

    if (feedbackText.trim().length < 10) {
      Alert.alert('Missing Information', 'Please provide more details in your feedback. Minimum 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      // Get device information
      const deviceInfo = Platform.OS + ' ' + Platform.Version;

      // Enhanced feedback data with more metadata
      const feedbackData = {
        category: selectedCategory,
        message: feedbackText,
        rating: rating,
        timestamp: serverTimestamp(),
        userId: user ? user.uid : 'anonymous',
        userEmail: user ? user.email : 'anonymous',
        // Add additional metadata
        deviceInfo: deviceInfo,
        appVersion: '1.0.2', // You can make this dynamic
        status: 'unread', // For tracking feedback status
        resolved: false
      };

      // Save to Firestore
      await addDoc(collection(db, 'feedback'), feedbackData);
      
      // Show success message and go back
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your feedback. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TextReaderRoot>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>
            {/* Screen title - readable with top priority */}
            <ReadableText style={styles.headerTitle} readable={true} priority={1}>
              Submit Feedback
            </ReadableText>
            <View style={styles.placeholder} />
          </View>
          
          {/* Main Content */}
          <View style={styles.content}>
            {/* Main heading - readable with priority 2 */}
            <ReadableText style={styles.sectionTitle} readable={true} priority={2}>
              How can we improve?
            </ReadableText>
            
            {/* Subheading - readable with priority 3 */}
            <ReadableText style={styles.sectionSubtitle} readable={true} priority={3}>
              Your feedback helps us make Lexera Life better for everyone.
            </ReadableText>
            
            {/* Category Selection */}
            <ReadableText style={styles.inputLabel} readable={true} priority={4}>
              Feedback Category
            </ReadableText>
            
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category} 
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  {/* Apply font style to category text */}
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText,
                      fontStyle
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Display selected category if one is chosen - readable with priority 5 */}
            {selectedCategory ? (
              <ReadableText style={styles.selectedCategoryInfo} readable={true} priority={5}>
                Selected category: {selectedCategory}
              </ReadableText>
            ) : null}
            
            {/* Rating */}
            <ReadableText style={styles.inputLabel} readable={true} priority={6}>
              Your Rating
            </ReadableText>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Icon 
                    name={star <= rating ? "star" : "star"} 
                    size={32} 
                    color={star <= rating ? "#FFD700" : "#D3D3D3"} 
                    solid={star <= rating}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Display selected rating if rated - readable with priority 7 */}
            {rating > 0 ? (
              <ReadableText style={styles.ratingInfo} readable={true} priority={7}>
                Your rating: {rating} {rating === 1 ? 'star' : 'stars'}
              </ReadableText>
            ) : null}
            
            {/* Feedback Text */}
            <ReadableText style={styles.inputLabel} readable={true} priority={8}>
              Your Feedback
            </ReadableText>
            
            <TextInput
              style={[styles.feedbackInput, fontStyle]}
              multiline
              numberOfLines={6}
              placeholder="Please share your thoughts, suggestions, or report issues..."
              placeholderTextColor="#999"
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.submitButtonText, fontStyle]}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategory: {
    backgroundColor: '#FFE6E6',
  },
  selectedCategoryText: {
    color: '#FF9999',
    fontWeight: '600',
  },
  selectedCategoryInfo: {
    fontSize: 14,
    color: '#FF9999',
    marginTop: 8,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  starButton: {
    marginRight: 12,
  },
  ratingInfo: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 8,
    fontWeight: '500',
  },
  feedbackInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    height: 150,
  },
  submitButton: {
    backgroundColor: '#FF9999',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
