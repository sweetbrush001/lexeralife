import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const TestIntroScreen = () => {
  const navigation = useNavigation();

  const renderCard = (title, description, onPress, gradientColors) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dyslexia{'\n'}Screening</Text>
        <Text style={styles.subtitle}>
          Choose an option below to begin your screening journey
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {renderCard(
          "Start New Test",
          "Begin a comprehensive dyslexia screening assessment",
          () => navigation.navigate("Test"),
          ["#4158D0", "#C850C0"]
        )}

        {renderCard(
          "View Results",
          "Access and analyze your previous screening results",
          () => navigation.navigate("PreviousResults"),
          ["#0093E9", "#80D0C7"]
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 70,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: "center",
    position: "relative",
    marginTop: 50,
   
  },
  subtitle: {
    fontSize: 26,
    color: "#666666",
    lineHeight: 24,
    letterSpacing: 0.1,
    textAlign: "center",
    marginTop: 10,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 16,
    minHeight: 140,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
});

export default TestIntroScreen;