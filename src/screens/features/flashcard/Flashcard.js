import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Flashcard = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <TouchableOpacity onPress={() => setIsFlipped(!isFlipped)}>
      <View style={styles.card}>
        <Text style={styles.text}>{isFlipped ? back : front}</Text>
      </View>
    </TouchableOpacity>
  );
};