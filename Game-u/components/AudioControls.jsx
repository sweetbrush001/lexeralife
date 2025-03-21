import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "../utils/mock-haptics"

const AudioControls = ({ onPlayAudio, playbackRate, setPlaybackRate }) => {
  const handlePlaybackRateChange = (newRate) => {
    setPlaybackRate(newRate)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const rates = [0.5, 0.25, 1, 1.25]

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={onPlayAudio} accessibilityLabel="Play word audio">
        <Feather name="volume-2" size={24} color="white" />
        <Text style={styles.playButtonText}>Play Sound</Text>
      </TouchableOpacity>

      <View style={styles.speedControls}>
        {rates.map((rate) => (
          <TouchableOpacity
            key={rate}
            style={[styles.speedButton, playbackRate === rate && styles.speedButton]}
            onPress={() => handlePlaybackRateChange(rate)}
          >
            <ImageBackground    source={require("../assets/images/tiny-wooden-button.png")}
                                style={styles.tinyButton}
                                resizeMode="stretch">
                                <Text style={[styles.speedButtonText, playbackRate === rate && styles.activeSpeedButtonText]}>{rate}x</Text>
             
            </ImageBackground>                   
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "50%",
    alignItems: "center",
    marginVertical: 10,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    marginBottom: 15,
  },
  playButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "OpenDyslexic",
    marginLeft: 8,
    alignContent: "center",
  },
  speedControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12, 
  },
  tinyButton: {
    width: 60,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  speedButtonText: {
    fontSize: 14,
    fontFamily: "OpenDyslexic",
    color: "#692d0a",
  },
  activeSpeedButtonText: {
    color: "white",
  },
})

export default AudioControls

