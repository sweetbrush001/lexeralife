import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

const ProfileImage = ({ 
  source, 
  style, 
  fallbackSource = require('../../assets/profilepic.png') 
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !source) {
    return <Image source={fallbackSource} style={style} />;
  }

  return (
    <Image 
      source={source} 
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default ProfileImage;
