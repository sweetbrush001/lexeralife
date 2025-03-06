import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }) => {
  // State for expanded FAQ items
  const [expandedFAQs, setExpandedFAQs] = useState({});

  // FAQ data
  const faqs = [
    {
      id: '1',
      question: 'How does Lexera Life help with dyslexia?',
      answer: 'Lexera Life provides customized reading support, brain training exercises, and community connection to help individuals with dyslexia improve their reading skills and confidence. Our text-to-speech and visual customization features make reading more accessible.'
    },
    {
      id: '2',
      question: 'Can I use Lexera Life without internet?',
      answer: 'Some features of Lexera Life require an internet connection, such as the community section and chat support. However, many reading tools and brain training exercises can be downloaded for offline use.'
    },
    {
      id: '3',
      question: 'How accurate is the dyslexia assessment?',
      answer: 'Our dyslexia assessment is designed as a preliminary screening tool based on established research, but it is not a clinical diagnosis. We recommend using the results as a starting point for discussion with educational or healthcare professionals.'
    },
    {
      id: '4',
      question: 'Is my personal data secure?',
      answer: 'Yes, we take data protection seriously. All personal information is encrypted and stored securely. We do not share your data with third parties without explicit consent. You can review our full privacy policy in the app settings.'
    },
    {
      id: '5',
      question: 'How can I customize text appearance?',
      answer: 'You can customize text appearance in the Settings section. Options include font style, size, spacing, background color, and contrast settings designed specifically for dyslexic readers.'
    }
  ];

  // Toggle FAQ expansion
  const toggleFAQ = (id) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Support contact options
  const supportOptions = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@lexeralife.com')
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'message-square',
      action: () => navigation.navigate('Chatbot', { supportMode: true })
    },
    {
      id: 'guide',
      title: 'User Guide',
      description: 'Detailed instructions for all features',
      icon: 'book-open',
      action: () => navigation.navigate('UserGuide')
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve Lexera Life',
      icon: 'send',
      action: () => navigation.navigate('Feedback')
    }
  ];
  
  // Video tutorials with online images
  const videoTutorials = [
    {
      id: 'tutorial1',
      title: 'Getting Started with Lexera Life',
      thumbnail: 'https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      url: 'https://www.youtube.com'
    },
    {
      id: 'tutorial2',
      title: 'Using the Text Reader Feature',
      thumbnail: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      url: 'https://www.youtube.com'
    },
    {
      id: 'tutorial3',
      title: 'Brain Training Exercises',
      thumbnail: 'https://images.unsplash.com/photo-1580894732930-0babd100d356?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      url: 'https://www.youtube.com'
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF9F9F', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Support Options */}
        <Text style={styles.sectionTitle}>How can we help you?</Text>
        <View style={styles.supportGrid}>
          {supportOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={styles.supportCard}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={styles.supportIconContainer}>
                <Feather name={option.icon} size={22} color="#FF6B6B" />
              </View>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqs.map(faq => (
            <TouchableOpacity 
              key={faq.id} 
              style={[
                styles.faqItem,
                expandedFAQs[faq.id] && styles.faqItemExpanded
              ]}
              onPress={() => toggleFAQ(faq.id)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Feather 
                  name={expandedFAQs[faq.id] ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </View>
              
              {expandedFAQs[faq.id] && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Video Tutorials - Now using online images */}
        <Text style={styles.sectionTitle}>Video Tutorials</Text>
        <View style={styles.videoSection}>
          {videoTutorials.map(tutorial => (
            <TouchableOpacity 
              key={tutorial.id} 
              style={styles.videoCard} 
              onPress={() => Linking.openURL(tutorial.url)}
            >
              <View style={styles.videoThumbnail}>
                <Image 
                  source={{ uri: tutorial.thumbnail }} 
                  style={styles.thumbnailImage}
                />
                <View style={styles.playButton}>
                  <Feather name="play" size={24} color="#fff" />
                </View>
              </View>
              <Text style={styles.videoTitle}>{tutorial.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Community Support Card with Online Image */}
        <View style={styles.communityCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }}
            style={styles.communityImage}
          />
          <MaterialIcons name="people" size={36} color="#FF6B6B" />
          <Text style={styles.communityTitle}>Join Our Community</Text>
          <Text style={styles.communityText}>
            Connect with others, share experiences, and get advice from the Lexera Life community.
          </Text>
          <TouchableOpacity 
            style={styles.communityButton}
            onPress={() => navigation.navigate('Community')}
          >
            <Text style={styles.communityButtonText}>Open Community</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactText}>
            Need more help? Contact us directly at{' '}
            <Text 
              style={styles.emailLink}
              onPress={() => Linking.openURL('mailto:help@lexeralife.com')}
            >
              help@lexeralife.com
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 50 : 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  supportDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  faqContainer: {
    marginBottom: 10,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  faqItemExpanded: {
    backgroundColor: '#fff',
    borderColor: '#FFE6E6',
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    lineHeight: 22,
  },
  videoSection: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    height: 180,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    padding: 16,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  communityImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.3,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  communityText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  communityButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  contactSection: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contactText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailLink: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;
