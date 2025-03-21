"use client"

import { useState, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Audio } from "expo-av"
import * as Haptics from "./utils/mock-haptics"

export default function JungleAudio({ isPlaying = true }) {
  const [sound, setSound] = useState(null)
  const [isMuted, setIsMuted] = useState(!isPlaying)
  const isMountedRef = useRef(true)

  useEffect(() => {
    let soundObject = null

    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        })

        const { sound: jungleSound } = await Audio.Sound.createAsync(
          require("./assets/sounds/jungle-ambience.mp3"),
          {
            isLooping: true,
            volume: 0.3,
            shouldPlay: !isMuted,  // Play immediately if not muted
          }
        )

        soundObject = jungleSound

        if (isMountedRef.current) {
          setSound(jungleSound)
        }
      } catch (error) {
        console.error("Error loading jungle ambient sound:", error)
      }
    }

    loadSound()

    return () => {
      isMountedRef.current = false

      if (soundObject) {
        const cleanup = async () => {
          try {
            await soundObject.stopAsync()
            await soundObject.unloadAsync()
            console.log("Difficulty select sound cleaned up successfully")
          } catch (error) {
            console.error("Error cleaning up sound:", error)
          }
        }
        cleanup()
      }
    }
  }, [])

  const toggleSound = async () => {
    if (!sound) {
      console.warn("Sound is not loaded yet!")
      return
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const newMutedState = !isMuted
      setIsMuted(newMutedState)

      if (newMutedState) {
        await sound.pauseAsync()
      } else {
        // Ensure sound is loaded before attempting to play
        const status = await sound.getStatusAsync()
        if (!status.isLoaded) {
          await sound.loadAsync()
        }
        await sound.playAsync()
      }
    } catch (error) {
      console.error("Error toggling sound:", error)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.soundButton}
        onPress={toggleSound}
        accessibilityLabel={isMuted ? "Turn on jungle sounds" : "Turn off jungle sounds"}
      >
        <Image
        source={isMuted ? require("./assets/images/volume-mute.png") : require("./assets/images/volume-on.png")}
        style={styles.soundIcon}
      />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  soundButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    position: "absolute",
    top:70,
    right: 5,
    justifyContent: "center",
    alignItems: "center",
  },
    soundIcon: {
        width: "100%",
        height: "100%",
    },
})
