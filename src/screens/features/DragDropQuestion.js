import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";

const DragDropQuestion = ({ question, options, onAnswer }) => {
  const [items, setItems] = useState(options);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.questionText}>{question}</Text>
        <DraggableFlatList
          data={items}
          renderItem={({ item, drag, isActive }) => (
            <TouchableOpacity
              style={[styles.item, isActive && styles.activeItem]}
              onLongPress={drag}
            >
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `draggable-item-${index}`}
          onDragEnd={({ data }) => setItems(data)}
        />
        <TouchableOpacity style={styles.button} onPress={() => onAnswer(items)}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeItem: {
    backgroundColor: "#d3d3d3",
  },
  itemText: {
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default DragDropQuestion;
