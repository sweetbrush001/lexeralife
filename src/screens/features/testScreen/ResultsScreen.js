import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebaseConfig"; // Import Firebase config
import { collection, addDoc } from "firebase/firestore";
import { useTextStyle } from '../../../hooks/useTextStyle';

const ResultsScreen = ({ route }) => {
  const { answers } = route.params;
  const navigation = useNavigation();
  const user = auth.currentUser; // Get the logged-in user
  const [isSaving, setIsSaving] = useState(true);
  const textStyle = useTextStyle();

  const getResult = () => {
    const yesAnswers = answers.filter((answer) => answer === true).length;
    const percentage = ((yesAnswers / answers.length) * 100).toFixed(0);

    let resultText = "";
    if (percentage >= 60) {
      resultText = "You may have signs of dyslexia. Consider consulting a professional.";
    } else {
      resultText = "Your responses suggest you may not have dyslexia, but consult a professional if needed.";
    }

    return { text: resultText, percentage };
  };

  const { text: resultText, percentage } = getResult();

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return "#FF453A"; // Red for high
    if (percentage >= 40) return "#FF9F0A"; // Orange for medium
    return "#34C759"; // Green for low
  };

  const percentageColor = getPercentageColor(percentage);

  // Auto-save the result when the screen loads
  useEffect(() => {
    const saveResultToFirebase = async () => {
      if (!user) {
        Alert.alert("Error", "You must be logged in to save results.");
        setIsSaving(false);
        return;
      }

      try {
        await addDoc(collection(db, "testResults"), {
          userId: user.uid,
          percentage: percentage,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving result:", error);
        Alert.alert("Error", "Failed to save result.");
      }
      setIsSaving(false);
    };

    saveResultToFirebase();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, textStyle]}>Results</Text>

        <View style={[styles.percentageCircle, { borderColor: percentageColor }]}>
          <Text style={[styles.percentageText, { color: percentageColor }, textStyle]}>{percentage}%</Text>
        </View>

        <Text style={[styles.resultText, textStyle]}>{resultText}</Text>

        {isSaving ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("PreviousResults")}>
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={[styles.buttonText, textStyle]}>View Previous Results</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={[styles.buttonText, textStyle]}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5E9", padding: 20 },
  card: { width: "90%", maxWidth: 400, padding: 30, backgroundColor: "#FFFFFF", borderRadius: 20, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 16 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 20, color: "#333" },
  percentageCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 5, alignSelf: "center", justifyContent: "center", alignItems: "center", marginBottom: 30 },
  percentageText: { fontSize: 24, fontWeight: "600" },
  resultText: { fontSize: 20, textAlign: "center", marginVertical: 30, color: "#4A4A4A", lineHeight: 28 },
  button: { backgroundColor: "#007BFF", paddingVertical: 15, paddingHorizontal: 30, marginTop: 20, borderRadius: 30, flexDirection: "row", alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#007BFF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: 10 },
});

export default ResultsScreen;
