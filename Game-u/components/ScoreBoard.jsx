import { View, Text, StyleSheet } from "react-native"

const ScoreBoard = ({ score, total, currentIndex }) => {
  const progressPercentage = (currentIndex / total) * 100

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          Score: {score}/{total}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Word {currentIndex + 1} of {total}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 26,
    fontFamily: "OpenDyslexic",
    color: "#6e4005",
    fontWeight: "bold",
  },
  progressContainer: {
    width: "100%",
  },
  progressBackground: {
    height: 15,
    backgroundColor: "#7acf7d",
    borderColor:"#A26017",
    borderWidth: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#B2711D",
    borderRadius: 10,
  },
  progressText: {
    fontSize: 15,
    fontFamily: "OpenDyslexic",
    color: "#362003",
    textAlign: "center",
    marginTop: 5,
  },
})

export default ScoreBoard

