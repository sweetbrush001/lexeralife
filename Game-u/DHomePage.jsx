"use client"

import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import * as Haptics from "./utils/mock-haptics"

const { width } = Dimensions.get("window")

export default function HomePage({ onSelectGame }) {
  const handleSelectGame = (game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onSelectGame(game)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>lexeraLife Games</Text>

      <View style={styles.gamesContainer}>
        {/* Spelling Game Card */}
        <TouchableOpacity style={styles.gameCard} onPress={() => handleSelectGame("spelling")}>
          <View style={styles.imageContainer}>
            <Image 
              source={require('./assets/images/spelling_game_thumbnail.png')} 
              style={styles.gameImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.gameLabel}>
            <Text style={styles.gameLabelText}>Ocean Spelling Adventure</Text>
          </View>
        </TouchableOpacity>

        {/* Space Fill Game Card (Placeholder) */}
        <TouchableOpacity style={styles.gameCard}>
          <View style={styles.imageContainer}>
            <Text style={styles.placeholderText}>image for another game</Text>
          </View>
          <View style={styles.gameLabel}>
            <Text style={styles.gameLabelText}>space fill game</Text>
          </View>
        </TouchableOpacity>

        {/* Another Game Card (Placeholder) */}
        <TouchableOpacity style={styles.gameCard}>
          <View style={styles.imageContainer}>
            <Text style={styles.placeholderText}>image for another game</Text>
          </View>
          <View style={styles.gameLabel}>
            <Text style={styles.gameLabelText}>another game</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Navigation Indicator */}
      <View style={styles.navIndicator}>
        <View style={styles.navDot} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBFFD6", // Light green background as shown in mockup
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "OpenDyslexic-Bold",
    color: "#000000",
    marginTop: 40,
    marginBottom: 40,
  },
  gamesContainer: {
    width: "100%",
    alignItems: "center",
    gap: 30,
  },
  gameCard: {
    width: width * 0.85,
    height: 140,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    overflow: "hidden",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: "#888888",
    fontSize: 16,
    fontFamily: "OpenDyslexic",
  },
  gameLabel: {
    height: 40,
    backgroundColor: "#D8D8D8",
    justifyContent: "center",
    alignItems: "center",
  },
  gameLabelText: {
    fontSize: 18,
    fontFamily: "OpenDyslexic",
    color: "#000000",
  },
  navIndicator: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  navDot: {
    width: 30,
    height: 4,
    backgroundColor: "#000000",
    borderRadius: 2,
  },
})