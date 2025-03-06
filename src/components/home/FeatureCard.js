import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ReadableText from '../ReadableText';

const FeatureCard = ({
  title,
  iconType,
  iconName,
  onPress,
  cardStyle,
  priority
}) => {
  const renderIcon = () => {
    if (iconType === 'feather') {
      return <Feather name={iconName} size={28} color="#FF6B6B" />;
    } else {
      return <MaterialCommunityIcons name={iconName} size={28} color="#FF6B6B" />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.featureCard, cardStyle]}
      onPress={onPress}
    >
      <BlurView intensity={10} style={styles.cardBlur}>
        {renderIcon()}
        <ReadableText style={styles.featureTitle} readable={true} priority={priority}>
          {title}
        </ReadableText>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardBlur: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default React.memo(FeatureCard);
