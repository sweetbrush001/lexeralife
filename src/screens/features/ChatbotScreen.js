import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Markdown from 'react-native-markdown-display'; // Import the markdown display component
import { useTextStyle } from '../../hooks/useTextStyle';
import DraggableVoiceButton from '../../components/DraggableVoiceButton';

const API_KEY = 'AIzaSyC4z7SclIMM4IUQJeEo_-DkesMuSlwgMsk';
const modelname = 'tunedModels/lexerabotdyslexiadataset-nwcwefqh293';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${modelname}:generateContent?key=${API_KEY}`;

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Lexera Bot. How can I help you today?", isBot: true },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();
  const textStyle = useTextStyle();

  const handleSend = async () => {
    if (!inputText.trim()) return;
  
    const userMessage = { id: messages.length + 1, text: inputText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
  
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{
          role: "user",
          parts: [{
            text: inputText
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const botResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that.";
  
      setMessages((prev) => [...prev, { id: prev.length + 1, text: botResponse, isBot: true }]);
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      if (error.response) {
        // Handle known errors from the server
        Alert.alert("API Error", `Error: ${error.response.status} - ${error.response.data}`);
      } else {
        // Handle other errors like network issues
        Alert.alert("Network Error", "There was an error connecting to the server. Please try again later.");
      }
  
      setMessages((prev) => [...prev, { id: prev.length + 1, text: 'Error: Unable to fetch response.', isBot: true }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../../../assets/background.png')} style={styles.backgroundImage}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="chevron-left" size={22} color="#666" />
          </TouchableOpacity>
          <View style={styles.botInfo}>
            <View style={styles.botIconContainer}>
              <Icon name="robot" size={22} color="#A990FF" />
            </View>
            <Text style={styles.botName}>Lexera Bot</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="ellipsis-v" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageWrapper, message.isBot ? styles.botMessageWrapper : styles.userMessageWrapper]}>
              {message.isBot && <View style={styles.botAvatar}><Icon name="robot" size={18} color="#A990FF" /></View>}
              <View style={[styles.message, message.isBot ? styles.botMessage : styles.userMessage]}>
                <Markdown style={message.isBot ? styles.botMessageText : styles.userMessageText}>
                  {message.text}
                </Markdown>
              </View>
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="paperclip" size={22} color="#666" />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, textStyle]}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]} onPress={handleSend} disabled={!inputText.trim()}>
              <Icon name="paper-plane" size={22} color={inputText.trim() ? "#fff" : "#999"} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <DraggableVoiceButton />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  botInfo: { flexDirection: 'row', alignItems: 'center' },
  botIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAE6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  messagesContainer: { flex: 1, padding: 15 },
  messageWrapper: { flexDirection: 'row', marginBottom: 12, maxWidth: '75%' },
  botMessageWrapper: { alignSelf: 'flex-start' },
  userMessageWrapper: { alignSelf: 'flex-end' },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAE6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  message: { padding: 12, borderRadius: 15 },
  botMessage: { backgroundColor: '#F3F3F3', alignSelf: 'flex-start' },
  userMessage: { backgroundColor: '#A990FF', alignSelf: 'flex-end' },
  botMessageText: { color: '#333', fontSize: 18 }, // Increase font size for bot messages
  userMessageText: { color: '#fff', fontSize: 18 }, // Increase font size for user messages
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', padding: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: { flex: 1, fontSize: 16, padding: 8, maxHeight: 100 },
  attachButton: { padding: 10 },
  sendButton: { padding: 10, borderRadius: 50 },
  sendButtonActive: { backgroundColor: '#A990FF' },
});

export default ChatbotScreen;
