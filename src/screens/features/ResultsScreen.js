import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ResultsScreen = ({ route }) => {
  const { answers } = route.params;
  const navigation = useNavigation();

  const getResult = () => {
    const yesAnswers = answers.filter(answer => answer === true).length;
    const percentage = (yesAnswers / answers.length) * 100;

    let resultText = '';
    if (percentage >= 60) {
      resultText = 'You may have some signs of dyslexia. It could be helpful to consult a professional for further evaluation.';
    } else {
      resultText = 'Your responses suggest that you may not have signs of dyslexia, but consult a professional if you have concerns.';
    }

    return {
      text: resultText,
      percentage: percentage.toFixed(0), // Round to nearest whole number
    };
  };

  const { text: resultText, percentage } = getResult();

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) {
      return '#FF453A'; // Red for high percentages
    } else if (percentage >= 40) {
      return '#FF9F0A'; // Orange for medium percentages
    } else {
      return '#34C759'; // Green for low percentages
    }
  };

  const percentageColor = getPercentageColor(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Results</Text>
        <View style={[styles.percentageCircle, { borderColor: percentageColor }]}>
          <Text style={[styles.percentageText, { color: percentageColor }]}>{percentage}%</Text>
        </View>
        <Text style={styles.resultText}>{resultText}</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  percentageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 30,
    color: '#4A4A4A',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

export default ResultsScreen;
