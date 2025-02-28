
import React, {useState} from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { pickAndProcessFile } from "../../../util/fileProcessor";
import Flashcard from "../flashcard/Flashcard";

const FlashcardGenerationScreen = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    const text = await pickAndProcessFile();

    if (text){
        //Splitting text into sentences or paragrapghs for flashcards
        const sentences = text.split(/[.!?]/).filter((s) => s.trim() !== "");
      const newFlashcards = sentences.map((sentence, index) => ({
        id: index,
        front: sentence.trim(),
        back: `Definition or explanation for: ${sentence.trim()}`,
      }));
      setFlashcards(newFlashcards);
    }
    setIsLoading(false);

    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      };
    
      const handlePrevious = () => {
        setCurrentIndex(
          (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
        );
      };
    
      return (
        <View style={styles.container}>
          <Button title="Pick a File" onPress={handleGenerateFlashcards} />
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            flashcards.length > 0 && (
              <>
                <Flashcard
                  front={flashcards[currentIndex].front}
                  back={flashcards[currentIndex].back}
                />
                <View style={styles.buttons}>
                  <Button title="Previous" onPress={handlePrevious} />
                  <Button title="Next" onPress={handleNext} />
                </View>
              </>
            )
          )}
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      },
      buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "60%",
      },
    });
    
    export default FlashcardGenerationScreen;
