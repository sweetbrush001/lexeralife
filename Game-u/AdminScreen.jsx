"use client"

import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { addWord, uploadAudio, uploadImage } from "./utils/supabaseService"

export default function AdminScreen() {
  const [word, setWord] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedAudio, setSelectedAudio] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      })

      if (!result.canceled) {
        setSelectedImage({
          uri: result.assets[0].uri,
          name: `${word.toLowerCase()}_${Date.now()}.jpg`,
          type: "image/jpeg",
        })
        Alert.alert("Success", "Image selected")
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      })

      if (!result.canceled) {
        setSelectedAudio({
          uri: result.assets[0].uri,
          name: `${word.toLowerCase()}_${Date.now()}.mp3`,
          type: result.assets[0].mimeType,
        })
        Alert.alert("Success", "Audio file selected")
      }
    } catch (error) {
      console.error("Error picking audio file:", error)
      Alert.alert("Error", "Failed to pick audio file")
    }
  }

  const handleAddWord = async () => {
    if (!word.trim()) {
      Alert.alert("Error", "Please enter a word")
      return
    }

    if (!selectedImage || !selectedAudio) {
      Alert.alert("Error", "Please select both an image and audio file")
      return
    }

    setIsLoading(true)

    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(selectedImage, selectedImage.name)

      // Upload audio to Supabase Storage
      const audioUrl = await uploadAudio(selectedAudio, selectedAudio.name)

      // Add word to Supabase Database
      const newWord = await addWord({
        word: word.toLowerCase(),
        difficulty,
        image_url: imageUrl,
        audio_url: audioUrl,
        created_at: new Date().toISOString(),
      })

      Alert.alert("Success", `Added "${word}" to the database!`)

      // Reset form
      setWord("")
      setSelectedImage(null)
      setSelectedAudio(null)
    } catch (error) {
      console.error("Error adding word:", error)
      Alert.alert("Error", "Failed to add word to database")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin - Add New Words</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 1: Enter Word Details</Text>

        <Text style={styles.label}>Word:</Text>
        <TextInput style={styles.input} value={word} onChangeText={setWord} placeholder="Enter a word (e.g., apple)" />

        <Text style={styles.label}>Difficulty:</Text>
        <View style={styles.difficultyButtons}>
          <TouchableOpacity
            style={[styles.difficultyButton, difficulty === "easy" && styles.activeDifficultyButton]}
            onPress={() => setDifficulty("easy")}
          >
            <Text style={[styles.difficultyButtonText, difficulty === "easy" && styles.activeDifficultyButtonText]}>
              Easy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, difficulty === "medium" && styles.activeDifficultyButton]}
            onPress={() => setDifficulty("medium")}
          >
            <Text style={[styles.difficultyButtonText, difficulty === "medium" && styles.activeDifficultyButtonText]}>
              Medium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, difficulty === "hard" && styles.activeDifficultyButton]}
            onPress={() => setDifficulty("hard")}
          >
            <Text style={[styles.difficultyButtonText, difficulty === "hard" && styles.activeDifficultyButtonText]}>
              Hard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 2: Select Image</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
        <Text style={styles.info}>{selectedImage ? "Image selected ✓" : "No image selected"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 3: Select Audio</Text>
        <TouchableOpacity style={styles.button} onPress={pickAudio}>
          <Text style={styles.buttonText}>Pick Audio File</Text>
        </TouchableOpacity>
        <Text style={styles.info}>{selectedAudio ? "Audio selected ✓" : "No audio selected"}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.disabledButton]}
          onPress={handleAddWord}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>{isLoading ? "Adding..." : "Add Word to Database"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontFamily: "OpenDyslexic",
    color: "#6A1B9A",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "OpenDyslexic",
    color: "#6A1B9A",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: "OpenDyslexic",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontFamily: "OpenDyslexic",
    fontSize: 16,
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8E24AA",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeDifficultyButton: {
    backgroundColor: "#8E24AA",
  },
  difficultyButtonText: {
    fontSize: 14,
    fontFamily: "OpenDyslexic",
    color: "#8E24AA",
  },
  activeDifficultyButtonText: {
    color: "white",
  },
  button: {
    backgroundColor: "#8E24AA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "OpenDyslexic",
  },
  info: {
    fontSize: 14,
    fontFamily: "OpenDyslexic",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#6A1B9A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9E9E9E",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "OpenDyslexic",
    fontWeight: "bold",
  },
})

