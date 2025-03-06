import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useTextStyle } from '../../../hooks/useTextStyle';
import LoadingScreen from '../../../screens/loading/LoadingScreen';
import OrbitLoader from '../../../components/ui/OrbitLoader';

const { width } = Dimensions.get("window");

const getScoreColors = (percentage) => {
  if (percentage <= 30) {
    return ['#00b09b', '#96c93d']; // Green (Good)
  } else if (percentage <= 70) {
    return ['#FDB99B', '#FF9966']; // Orange (Medium)
  } else {
    return ['#FF416C', '#FF4B2B']; // Red (Bad)
  }
};

const getRiskLevel = (percentage) => {
  if (percentage <= 30) {
    return { text: 'your good', color: '#00b09b' };
  } else if (percentage <= 70) {
    return { text: 'little bit possible', color: '#FF9966' };
  } else {
    return { text: 'possible you having dyslexia', color: '#FF416C' };
  }
};

const ResultCard = ({ item, onDelete, animationValue, isDeleting }) => {
  const scoreColors = getScoreColors(item.percentage);
  const risk = getRiskLevel(item.percentage);
  const textStyle = useTextStyle();
  
  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          transform: [{ scale: animationValue }],
          opacity: animationValue,
        },
      ]}
    >
      {isDeleting && (
        <View style={styles.deletingOverlay}>
          <OrbitLoader size={40} color="#FF5252" />
        </View>
      )}
      
      <LinearGradient
        colors={scoreColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scoreContainer}
      >
        <Text style={[styles.scoreText, textStyle]}>{item.percentage}%</Text>
      </LinearGradient>
      
      <View style={styles.resultInfo}>
        <Text style={[styles.dateText, textStyle]}>
          {new Date(item.timestamp?.toDate()).toLocaleDateString()}
        </Text>
        <Text style={[styles.timeText, textStyle]}>
          {new Date(item.timestamp?.toDate()).toLocaleTimeString()}
        </Text>
        <Text style={[styles.riskText, { color: risk.color }, textStyle]}>
          {risk.text}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF5252" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const PreviousResultsScreen = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted
  const navigation = useNavigation();
  const user = auth.currentUser;
  const fadeAnim = new Animated.Value(0);
  const textStyle = useTextStyle();

  useEffect(() => {
    if (user) {
      fetchResults();  // Fetch results only if user is logged in
    }
  }, [user]);

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [results]);

  const fetchResults = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "testResults"),
        where("userId", "==", user.uid)  // Fetch only the logged-in user's results
      );
      const querySnapshot = await getDocs(q);
      const fetchedResults = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort results by timestamp (newest first)
      setResults(fetchedResults);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResult = async (id) => {
    Alert.alert(
      "Delete Result",
      "Are you sure you want to delete this result?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id); // Set the deleting status
              await deleteDoc(doc(db, "testResults", id));  // Delete result from Firestore
              setResults(results.filter((item) => item.id !== id));  // Remove result from UI
            } catch (error) {
              console.error("Error deleting result:", error);
              Alert.alert("Error", "Failed to delete this result. Please try again.");
            } finally {
              setDeletingId(null); // Clear the deleting status
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>Previous Results</Text>
        <Text style={[styles.subtitle, textStyle]}>View and manage your test history</Text>
      </View>

      {loading ? (
        <LoadingScreen message="Loading your results..." color="#6C63FF" />
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CBD5E0" />
          <Text style={[styles.noResults, textStyle]}>No previous results found</Text>
          <Text style={[styles.noResultsSubtext, textStyle]}>
            Take a test to see your results here
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ResultCard
              item={item}
              onDelete={deleteResult}
              animationValue={fadeAnim}
              isDeleting={deletingId === item.id} // Pass the deleting status to the card
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <LinearGradient
          colors={['#6C63FF', '#4834DF']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.buttonText}>Go Back</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 34,
    fontWeight: Platform.select({ ios: '800', android: 'bold' }),
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    letterSpacing: 0.3,
  },
  listContainer: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  backButton: {
    margin: 16,
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResults: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 16,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default PreviousResultsScreen;
