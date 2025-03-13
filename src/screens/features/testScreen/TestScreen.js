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
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTextStyle } from '../../../hooks/useTextStyle';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const DyslexiaTestScreen = () => {
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const questionAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleYes = useRef(new Animated.Value(1)).current;
  const buttonScaleNo = useRef(new Animated.Value(1)).current;
  const textStyle = useTextStyle();

  // Track total questions for progress calculation
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedCategories = querySnapshot.docs.map((doc) => doc.data());
        
        if (fetchedCategories.length === 0) {
          setError("No questions found. Please try again later.");
        } else {
          setCategories(fetchedCategories);
          
          // Calculate total questions for progress tracking
          const total = fetchedCategories.reduce(
            (acc, cat) => acc + cat.questions.length, 
            0
          );
          setTotalQuestions(total);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Unable to load test questions. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Animate question appearance
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
    
    // Reset button scales
    buttonScaleYes.setValue(1);
    buttonScaleNo.setValue(1);
    
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: answers.length / totalQuestions,
      duration: 600,
      easing: Easing.outCubic,
      useNativeDriver: false,
    }).start();
  }, [categoryIndex, questionIndex, answers.length, totalQuestions]);

  const handleAnswer = (answer) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(answer ? buttonScaleYes : buttonScaleNo, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(answer ? buttonScaleYes : buttonScaleNo, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.timing(questionAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
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

  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Show confirmation dialog
    navigation.navigate("ConfirmExit", {
      onConfirm: () => navigation.navigate("Home"),
      message: "Are you sure you want to exit the test? Your progress will be lost."
    });
  };

  const calculateProgress = () => {
    if (!totalQuestions) return 0;
    return (answers.length / totalQuestions) * 100;
  };

  const getCurrentQuestionNumber = () => {
    if (!categories.length) return 0;
    
    let previousCategoriesQuestions = 0;
    for (let i = 0; i < categoryIndex; i++) {
      previousCategoriesQuestions += categories[i].questions.length;
    }
    
    return previousCategoriesQuestions + questionIndex + 1;
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={[styles.loadingText, textStyle]}>Preparing your assessment...</Text>
              <View style={styles.loadingProgressBar}>
                <Animated.View style={[styles.loadingProgressFill, {
                  width: new Animated.Value(0).interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                }]} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require("../../../../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={70} color="#F44336" />
              <Text style={[styles.errorText, textStyle]}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setLoading(true);
                  setError(null);
                  // Re-fetch questions
                  const fetchQuestions = async () => {
                    try {
                      const querySnapshot = await getDocs(collection(db, "questions"));
                      const fetchedCategories = querySnapshot.docs.map((doc) => doc.data());
                      setCategories(fetchedCategories);
                      const total = fetchedCategories.reduce(
                        (acc, cat) => acc + cat.questions.length, 
                        0
                      );
                      setTotalQuestions(total);
                      setError(null);
                    } catch (error) {
                      console.error("Error fetching questions:", error);
                      setError("Unable to load test questions. Please check your connection and try again.");
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchQuestions();
                }}
              >
                <Text style={[styles.retryButtonText, textStyle]}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.homeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Home");
                }}
              >
                <Text style={[styles.homeButtonText, textStyle]}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={require("../../../../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient 
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']} 
          style={styles.overlay} 
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.exitButton} 
            onPress={handleExit}
            accessibilityLabel="Exit test"
            accessibilityHint="Double tap to exit the current test"
          >
            <View style={styles.exitButtonInner}>
              <Ionicons name="arrow-back" size={22} color="#37474F" />
              <Text style={[styles.exitButtonText, textStyle]}>Exit</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, textStyle]}>Dyslexia Screening</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <View style={styles.questionCounter}>
              <FontAwesome5 name="question-circle" size={16} color="#1976D2" style={styles.questionIcon} />
              <Text style={[styles.progressText, textStyle]}>
                Question {getCurrentQuestionNumber()} of {totalQuestions}
              </Text>
            </View>
            <Text style={[styles.progressPercentage, textStyle]}>
              {`${Math.round(calculateProgress())}%`}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) 
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
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
            <View style={styles.categoryBadge}>
              <FontAwesome5 
                name={getCategoryIcon(categories[categoryIndex].category)} 
                size={14} 
                color="#1976D2" 
                style={styles.categoryIcon}
              />
              <Text style={[styles.categoryText, textStyle]}>
                {categories[categoryIndex].category}
              </Text>
            </View>
            
            <Text style={[styles.questionText, textStyle]}>
              {categories[categoryIndex].questions[questionIndex]}
            </Text>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <Animated.View 
              style={{ 
                transform: [{ scale: buttonScaleYes }],
                flex: 1,
                marginRight: 8
              }}
            >
              <TouchableOpacity 
                style={[styles.button, styles.yesButton]} 
                onPress={() => handleAnswer(true)}
                accessibilityLabel="Yes"
                accessibilityHint="Select if your answer is yes"
              >
                <LinearGradient 
                  colors={['#66BB6A', '#43A047']} 
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="check" size={24} color="white" />
                  <Text style={[styles.buttonText, textStyle]}>Yes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={{ 
                transform: [{ scale: buttonScaleNo }],
                flex: 1,
                marginLeft: 8
              }}
            >
              <TouchableOpacity 
                style={[styles.button, styles.noButton]} 
                onPress={() => handleAnswer(false)}
                accessibilityLabel="No"
                accessibilityHint="Select if your answer is no"
              >
                <LinearGradient 
                  colors={['#EF5350', '#E53935']} 
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="close" size={24} color="white" />
                  <Text style={[styles.buttonText, textStyle]}>No</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Add help text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#78909C" />
            <Text style={[styles.helpText, textStyle]}>
              Answer based on your typical experiences
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Helper function to determine icon based on category
const getCategoryIcon = (category) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('reading')) return 'book-reader';
  if (lowerCategory.includes('writing')) return 'pencil-alt';
  if (lowerCategory.includes('memory')) return 'brain';
  if (lowerCategory.includes('attention')) return 'eye';
  if (lowerCategory.includes('organization')) return 'tasks';
  if (lowerCategory.includes('time')) return 'clock';
  if (lowerCategory.includes('math')) return 'calculator';
  if (lowerCategory.includes('social')) return 'users';
  return 'clipboard-list';
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  background: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1976D2",
    textAlign: "center",
  },
  exitButton: {
    padding: 8,
  },
  exitButtonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  exitButtonText: {
    color: "#37474F",
    marginLeft: 4,
    fontWeight: "500",
  },
  headerRightPlaceholder: {
    width: 60,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)"
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    width: width * 0.8,
  },
  loadingText: { 
    marginTop: 20, 
    marginBottom: 24,
    fontSize: 18, 
    color: "#37474F", 
    fontWeight: "500",
    textAlign: "center",
  },
  loadingProgressBar: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  loadingProgressFill: {
    height: "100%",
    backgroundColor: "#1976D2",
    borderRadius: 3,
    width: "70%", // Static for loading screen
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)"
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    width: width * 0.85,
  },
  errorText: {
    fontSize: 18,
    color: "#37474F",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 26,
  },
  retryButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  homeButton: {
    borderWidth: 1,
    borderColor: "#1976D2",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  homeButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "500"
  },
  progressContainer: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  questionCounter: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionIcon: {
    marginRight: 8,
  },
  progressText: { 
    fontSize: 16, 
    fontWeight: "500", 
    color: "#455A64",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1976D2",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(25, 118, 210, 0.15)",
    borderRadius: 20,
    overflow: "hidden"
  },
  progressFill: { 
    height: "100%", 
    backgroundColor: "#1976D2", 
    borderRadius: 20 
  },
  contentContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20, 
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    width: width - 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
  },
  categoryBadge: {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: "#1976D2", 
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionText: { 
    fontSize: 22, 
    textAlign: "center", 
    color: "#37474F", 
    lineHeight: 32,
    fontWeight: "500",
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: { 
    borderRadius: 20, 
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "700", 
    marginLeft: 10,
  },
  yesButton: { 
    shadowColor: "#4CAF50",
  },
  noButton: { 
    shadowColor: "#F44336", 
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  helpText: {
    fontSize: 14,
    color: "#546E7A",
    marginLeft: 6,
    fontWeight: "500",
  }
});

export default DyslexiaTestScreen;