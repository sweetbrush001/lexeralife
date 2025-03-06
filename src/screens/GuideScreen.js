import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description, color }) => (
  <View style={[styles.featureCard, { backgroundColor: color }]}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={32} color="#FFFFFF" />
    </View>
    <Text style={styles.featureCardTitle}>{title}</Text>
    <Text style={styles.featureCardDescription}>{description}</Text>
  </View>
);

const TipItem = ({ tip, icon }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipIconBackground}>
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </View>
    <Text style={styles.tipText}>{tip}</Text>
  </View>
);

const GuideScreen = () => {
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleContinue = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header with Wave Background */}
        <LinearGradient
          colors={['#4A80F0', '#3A66CC']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>Lexera Life</Text>
            <Text style={styles.subtitle}>Empowering your dyslexia journey</Text>
            
            <Image 
              source={{ 
                uri: 'https://img.freepik.com/free-vector/dyslexia-concept-illustration_114360-8855.jpg'
              }} 
              style={styles.headerIllustration}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            
            {imageError && (
              <View style={styles.errorContainer}>
                <Ionicons name="image-outline" size={40} color="#FFFFFF" />
                <Text style={styles.errorText}>Image not available</Text>
              </View>
            )}
          </View>
          
          {/* Wave SVG effect at the bottom of the header */}
          <View style={styles.waveContainer}>
            <Image 
              source={{ 
                uri: 'https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/wave-white.png?alt=media&token=6d45d577-9ea2-44b3-bd21-f337c3b789b3'
              }} 
              style={styles.wave}
              resizeMode="stretch"
            />
          </View>
        </LinearGradient>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeDescription}>
            Lexera Life is designed specifically to support you in overcoming challenges related to dyslexia. 
            Our tools and features make learning and reading more accessible and enjoyable.
          </Text>
        </View>

        {/* Features Grid Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Our Features</Text>
          
          <View style={styles.featuresGrid}>
            <FeatureCard 
              icon="game-controller" 
              title="Cognitive Games" 
              description="Improve reading skills through fun, interactive games"
              color="#4A80F0"
            />
            
            <FeatureCard 
              icon="chatbubble-ellipses" 
              title="AI Assistant" 
              description="Get reading and writing help when you need it"
              color="#FF8C42"
            />
            
            <FeatureCard 
              icon="clipboard" 
              title="Assessments" 
              description="Understand your unique dyslexia profile"
              color="#9649CB"
            />
            
            <FeatureCard 
              icon="people" 
              title="Community" 
              description="Connect with others on similar journeys"
              color="#4CAF50"
            />
          </View>
        </View>
        
        {/* Image Gallery */}
        <View style={styles.gallerySection}>
          <Text style={styles.sectionTitle}>How We Help</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryScrollContent}
          >
            <Image 
              source={{uri: 'https://img.freepik.com/free-vector/dyslexia-concept-illustration_114360-8855.jpg'}}
              style={styles.galleryImage}
              resizeMode="cover"
            />
            <Image 
              source={{uri: 'https://img.freepik.com/free-vector/children-learning-concept-illustration_114360-4112.jpg'}}
              style={styles.galleryImage}
              resizeMode="cover"
            />
            <Image 
              source={{uri: 'https://img.freepik.com/free-vector/kids-online-lessons-concept_23-2148520728.jpg'}}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={['rgba(74, 128, 240, 0.1)', 'rgba(74, 128, 240, 0.05)']}
            style={styles.tipsGradient}
          >
            <Text style={styles.tipsTitle}>Dyslexia-Friendly Design</Text>
            
            <TipItem 
              icon="text" 
              tip="Specialized fonts that improve readability"
            />
            
            <TipItem 
              icon="resize" 
              tip="Customizable text size and spacing"
            />
            
            <TipItem 
              icon="color-palette" 
              tip="Color themes to reduce visual stress"
            />
            
            <TipItem 
              icon="headset" 
              tip="Audio support for written content"
            />
          </LinearGradient>
        </View>
        
        {/* Testimonial Section */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialQuote}>
            "Lexera Life has transformed how I interact with text. Reading feels so much more natural now!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Sarah, 14</Text>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Start Your Journey</Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerIllustration: {
    width: width * 0.7,
    height: 200,
    marginTop: 5,
  },
  imageLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -2, // Slight overlap to avoid gap
    width: '100%',
    height: 50,
  },
  wave: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    letterSpacing: 0.3,
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  gallerySection: {
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  galleryScroll: {
    marginTop: 16,
    paddingBottom: 16,
  },
  galleryScrollContent: {
    paddingHorizontal: 4,
  },
  galleryImage: {
    width: width * 0.75,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
  },
  tipsCard: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipsGradient: {
    padding: 24,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    letterSpacing: 0.3,
  },
  testimonialSection: {
    padding: 24,
    alignItems: 'center',
  },
  testimonialQuote: {
    fontSize: 18,
    color: '#555555',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  testimonialAuthor: {
    fontSize: 16,
    color: '#4A80F0',
    fontWeight: '600',
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    elevation: 5,
  },
  continueButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  }
});

export default GuideScreen;
