import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ImageBackground, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const fontSize = (size) => {
  const baseSize = width > 550 ? size * 1.3 : size;
  return Math.round(baseSize * width / 375);
};

export default function AgeRangeSelector() {
  const navigation = useNavigation();
  const [selectedAgeRange, setSelectedAgeRange] = useState(null);

  // Age range options
  const ageRanges = [
    { 
      id: 1, 
      range: '6-12', 
      label: 'Years',
      position: 'right',
      characterImage: require('../../../assets/char1.png'),
      colors: ['#322B7C', '#4EBFED']
    },
    { 
      id: 2, 
      range: '13-17', 
      label: 'Years',
      position: 'left',
      characterImage: require('../../../assets/char2.png'),
      colors: ['#D6226A', '#FFC371']
    },
    { 
      id: 3, 
      range: '18+', 
      label: 'Years',
      position: 'right',
      characterImage: require('../../../assets/char3.png'),
      colors: ['#735B47', '#C8A696']
    },
  ];

  // Handle age range selection
  const handleAgeRangeSelect = (id) => {
    setSelectedAgeRange(id);
  };

  // Handle next button press - navigate to Home page
  const handleNextPress = () => {
    if (selectedAgeRange) {
      navigation.replace('Guide');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <ImageBackground 
        source={require('../../../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleOrange}>CHOSE </Text>
            <Text style={styles.titlePurple}>YOUR </Text>
            <Text style={styles.titlePink}>AGE</Text>
          </View>
          <Text style={styles.titleRangePurple}>RANGE</Text>
          
          {/* Age Range Cards */}
          <View style={styles.cardsContainer}>
            {ageRanges.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => handleAgeRangeSelect(item.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.cardGradient,
                    selectedAgeRange === item.id && styles.selectedCard
                  ]}
                >
                  <View style={styles.cardContent}>
                    {/* Text container - position based on item.position */}
                    <View style={[
                      styles.ageTextContainer,
                      item.position === 'right' ? styles.textLeft : styles.textRight
                    ]}>
                      <Text style={styles.ageNumber}>{item.range}</Text>
                      <Text style={styles.ageLabel}>{item.label}</Text>
                    </View>
                    
                    {/* Character image - position based on item.position */}
                    <View style={[
                      styles.characterImageContainer,
                      item.position === 'right' ? styles.imageRight : styles.imageLeft
                    ]}>
                      <Image 
                        source={item.characterImage}
                        style={[
                          styles.characterImage,
                          selectedAgeRange === item.id && styles.selectedCharacterImage
                        ]}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Next Button */}
          <TouchableOpacity 
            style={[
              styles.nextButton,
              !selectedAgeRange && styles.disabledButton
            ]}
            onPress={handleNextPress}
            disabled={!selectedAgeRange}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#5A2ECC', '#7656E0']}
              style={styles.buttonGradient}
            >
              <Image 
                source={require('../../../assets/Hatched Arrow.png')}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
    paddingTop: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleOrange: {
    fontSize: fontSize(42),
    fontWeight: 'bold',
    color: '#FFA94D',
  },
  titlePurple: {
    fontSize: fontSize(42),
    fontWeight: 'bold',
    color: '#6A5ACD',
  },
  titlePink: {
    fontSize: fontSize(42),
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  titleRangePurple: {
    fontSize: fontSize(52),
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: responsiveHeight(4),
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: responsiveHeight(16),
    borderRadius: 20,
    marginBottom: responsiveHeight(2.5),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: responsiveWidth(4),
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: 'white',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageTextContainer: {
    flex: 1,
  },
  textLeft: {
    alignItems: 'flex-start',
  },
  textRight: {
    alignItems: 'flex-start',
  },
  ageNumber: {
    fontSize: fontSize(48),
    fontWeight: 'bold',
    color: 'white',
  },
  ageLabel: {
    fontSize: fontSize(28),
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.9,
  },
  characterImageContainer: {
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
    flex: 1,
  },
  imageLeft: {
    alignItems: 'flex-start',
  },
  imageRight: {
    alignItems: 'flex-start',
  },
  characterImage: {
    width: responsiveWidth(40),
    height: responsiveHeight(40),
    marginBottom: responsiveHeight(-1),
  },
  selectedCharacterImage: {
    transform: [{ scale: 1.05 }],
  },
  nextButton: {
    width: responsiveWidth(18),
    height: responsiveWidth(18),
    borderRadius: responsiveWidth(9),
    overflow: 'hidden',
    marginTop: responsiveHeight(1),
    elevation: 8,
    shadowColor: '#5A2ECC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: responsiveHeight(7),
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(9),
  },
  arrowIcon: {
    width: responsiveWidth(20),
    height: responsiveHeight(10),
  },
  disabledButton: {
    opacity: 0.5,
  },
});