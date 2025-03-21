import { View, Text, StyleSheet, Image } from "react-native";

const WordDisplay = ({ word, showWord, imageUrl }) => {
  // If showWord is true, show the actual word
  // Otherwise, show placeholders for each letter

  const renderWord = () => {
    if (showWord) {
      return <Text style={styles.wordText}>{word}</Text>;
    } else {
      return (
        <View style={styles.letterContainer}>
          {word.split("").map((_, index) => (
            <View key={index} style={styles.letterPlaceholder}>
              <Text style={styles.placeholderText}>?</Text>
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Spell this word:</Text>
      {renderWord()}
      {/* Display the image if imageUrl is provided */}
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.wordImage} resizeMode="contain" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  prompt: {
    fontSize: 22,
    fontFamily: "OpenDyslexic",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  wordText: {
    fontSize: 32,
    fontFamily: "OpenDyslexic",
    color: "#6A1B9A",
    letterSpacing: 2,
  },
  letterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  letterPlaceholder: {
    width: 40,
    height: 50,
    borderBottomWidth: 3,
    borderBottomColor: "#6A1B9A",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  placeholderText: {
    fontSize: 28,
    fontFamily: "OpenDyslexic",
    color: "#9E9E9E",
  },
  wordImage: {
    width: 200, // Adjust as needed
    height: 200, // Adjust as needed
    marginVertical: 20,
    borderRadius: 10,
  },
});

export default WordDisplay;