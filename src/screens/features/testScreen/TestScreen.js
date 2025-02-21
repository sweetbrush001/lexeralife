import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { useTextStyle } from '../../../hooks/useTextStyle';

const { width, height } = Dimensions.get("window");

const DyslexiaTestScreen = () => {
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const questionAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textStyle = useTextStyle();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedCategories = querySnapshot.docs.map((doc) => doc.data());
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(questionAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [categoryIndex, questionIndex]);

  const handleAnswer = (answer) => {
    Animated.parallel([
      Animated.timing(questionAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const updatedAnswers = [...answers, answer];
      setAnswers(updatedAnswers);

      if (questionIndex < categories[categoryIndex].questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else if (categoryIndex < categories.length - 1) {
        setCategoryIndex(categoryIndex + 1);
        setQuestionIndex(0);
      } else {
        navigation.navigate("Results", { answers: updatedAnswers });
      }
    });
  };

  const calculateProgress = () => {
    if (!categories.length) return 0;
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    return (answers.length / totalQuestions) * 100;
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Preparing your test...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${calculateProgress()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{`${Math.round(calculateProgress())}%`}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.header, textStyle]}>Dyslexia Screening</Text>

          <Animated.View
            style={[
              styles.questionCard,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: questionAnim },
                  {
                    translateY: questionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.categoryText, textStyle]}>{categories[categoryIndex].category}</Text>
            <Text style={[styles.questionText, textStyle]}>
              {categories[categoryIndex].questions[questionIndex]}
            </Text>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={() => handleAnswer(true)}>
              <MaterialIcons name="check" size={24} color="white" />
              <Text style={[styles.buttonText, textStyle]}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.noButton]} onPress={() => handleAnswer(false)}>
              <MaterialIcons name="close" size={24} color="white" />
              <Text style={[styles.buttonText, textStyle]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 18, color: "#FFF", fontWeight: "500" },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    marginTop:110,
  },
  progressBar: {
    flex: 1,
    height: 22,
    backgroundColor: "rgba(57, 110, 202, 0.3)",
    borderRadius: 30,
    marginRight: 18,

  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 4 },
  progressText: { fontSize: 22, fontWeight: "600", color: "#000", width: 50, textAlign: "right" },
  contentContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop:-200 },
  header: { fontSize: 32, fontWeight: "bold", marginBottom: 30, color: "#000", textAlign: "center" },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: width - 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 30,
  },
  categoryText: { fontSize: 20, fontWeight: "600", marginBottom: 15, color: "#1976D2", textTransform: "uppercase" },
  questionText: { fontSize: 24, textAlign: "center", color: "#37474F", lineHeight: 32 },
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, paddingHorizontal: 35, borderRadius: 15, marginHorizontal: 10, width: 140, elevation: 5 },
  buttonText: { color: "white", fontSize: 20, fontWeight: "600", marginLeft: 8 },
  yesButton: { backgroundColor: "#4CAF50" },
  noButton: { backgroundColor: "#F44336" },
});

export default DyslexiaTestScreen;
