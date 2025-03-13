import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import { useTextStyle } from '../../hooks/useTextStyle';
import TTSVoiceButton from '../../components/TTSVoiceButton';
import { TextReaderProvider, useTextReader } from '../../context/TextReaderContext';
import ReadableText from '../../components/ReadableText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const API_KEY = 'AIzaSyC4z7SclIMM4IUQJeEo_-DkesMuSlwgMsk';
const modelname = 'tunedModels/lexerabotdyslexiadataset-nwcwefqh293';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${modelname}:generateContent?key=${API_KEY}`;

// Predefined quick responses
const QUICK_RESPONSES = [
  "What is dyslexia?",
  "Help with reading",
  "Study tips",
  "Tools for dyslexia"
];

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Lexera Bot. How can I help you today?", isBot: true },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const scrollViewRef = useRef();
  const textStyle = useTextStyle();
  const textReader = useTextReader();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');

  // Effects for animations when messages change
  useEffect(() => {
    if (messages.length > 2) {
      setShowQuickResponses(false);
    }
    
    // Message received animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Vibration feedback for new messages
    if (messages.length > 1 && messages[messages.length - 1].isBot) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [messages]);

  // Function to send a message through text input
  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    await sendMessage(inputText);
  };

  // Handle quick response selection
  const handleQuickResponse = async (response) => {
    await sendMessage(response);
  };

  // Common function to send messages from text input or speech
  const sendMessage = async (text) => {
    const userMessage = { id: messages.length + 1, text: text, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
  
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{
          role: "user",
          parts: [{
            text: text
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
        Alert.alert("API Error", `Error: ${error.response.status} - ${error.response.data}`);
      } else {
        Alert.alert("Network Error", "There was an error connecting to the server. Please try again later.");
      }
  
      setMessages((prev) => [...prev, { id: prev.length + 1, text: 'Error: Unable to fetch response.', isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Improved chat message component with readability
  const ChatMessage = ({ message, index }) => {
    // Calculate priority based on message position
    const priority = index + 1;
    const isLastMessage = index === messages.length - 1;
    
    return (
      <Animated.View 
        key={message.id} 
        style={[
          styles.messageWrapper, 
          message.isBot ? styles.botMessageWrapper : styles.userMessageWrapper,
          isLastMessage && { opacity: fadeAnim }
        ]}
      >
        {message.isBot && (
          <View style={styles.botAvatar}>
            <Icon name="robot" size={18} color="#A990FF" />
          </View>
        )}
        <View 
          style={[
            styles.message, 
            message.isBot ? styles.botMessage : styles.userMessage,
            message.isBot && styles.botMessageShadow
          ]}
        >
          <ReadableText 
            style={message.isBot ? styles.botMessageText : styles.userMessageText} 
            readable={true} 
            priority={priority}
          >
            {message.isBot ? message.text : message.text}
          </ReadableText>
        </View>
      </Animated.View>
    );
  };

  // Quick responses component
  const QuickResponsesSection = () => {
    if (!showQuickResponses) return null;
    
    return (
      <View style={styles.quickResponsesContainer}>
        <ReadableText style={styles.quickResponsesTitle} readable={true} priority={messages.length + 1}>
          Try asking:
        </ReadableText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickResponsesScroll}
        >
          {QUICK_RESPONSES.map((response, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickResponseButton}
              onPress={() => handleQuickResponse(response)}
            >
              <ReadableText 
                style={styles.quickResponseText} 
                readable={true} 
                priority={messages.length + index + 2}
              >
                {response}
              </ReadableText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
        <View style={styles.botAvatar}>
          <Icon name="robot" size={18} color="#A990FF" />
        </View>
        <View style={[styles.message, styles.botMessage, styles.typingIndicator]}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMid]} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <TextReaderProvider>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ImageBackground 
          source={require('../../../assets/background.png')} 
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.8 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
            >
              <Icon name="chevron-left" size={22} color="#666" />
            </TouchableOpacity>
            <View style={styles.botInfo}>
              <View style={styles.botIconContainer}>
                <Icon name="robot" size={22} color="#A990FF" />
              </View>
              <ReadableText style={styles.botName} readable={true} priority={0}>
                Lexera Bot
              </ReadableText>
            </View>
            {/* Settings icon removed */}
            <View style={styles.placeholderSpace} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                index={index}
              />
            ))}
            
            {isLoading && <TypingIndicator />}
            
            <QuickResponsesSection />
          </ScrollView>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.inputContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputWrapper}>
              {/* Paperclip icon removed */}
              <TextInput
                style={[styles.input, textStyle]}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                accessibilityLabel="Message input field"
                accessibilityHint="Type your message here"
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  inputText.trim() ? styles.sendButtonActive : null
                ]} 
                onPress={handleSend} 
                disabled={!inputText.trim() || isLoading}
                accessibilityLabel="Send message"
              >
                <Icon 
                  name="paper-plane" 
                  size={22} 
                  color={inputText.trim() && !isLoading ? "#fff" : "#999"} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          
          {/* Add the TTSVoiceButton component */}
          <TTSVoiceButton />
        </ImageBackground>
      </SafeAreaView>
    </TextReaderProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FAF9FE',
  },
  backgroundImage: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6F3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  placeholderSpace: {
    width: 42, // Approximately the same width as the backButton
  },
  botInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(234, 230, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  botIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#A990FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333',
  },
  messagesContainer: { 
    flex: 1, 
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 30,
  },
  messageWrapper: { 
    flexDirection: 'row', 
    marginBottom: 16, 
    maxWidth: '80%',
  },
  botMessageWrapper: { 
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  userMessageWrapper: { 
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  message: { 
    padding: 14, 
    borderRadius: 20,
  },
  botMessage: { 
    backgroundColor: '#F9F8FF', 
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  botMessageShadow: {
    shadowColor: '#8F7AD4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessage: { 
    backgroundColor: '#A990FF', 
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  botMessageText: { 
    color: '#333', 
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: { 
    color: '#fff', 
    fontSize: 16,
    lineHeight: 22,
  },
  typingIndicator: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 70,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A990FF',
    marginHorizontal: 2,
    opacity: 0.7,
  },
  typingDotMid: {
    opacity: 0.5,
    transform: [{ translateY: -4 }],
  },
  quickResponsesContainer: {
    marginTop: 10,
    marginBottom: 5,
    paddingTop: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickResponsesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
    paddingLeft: 5,
  },
  quickResponsesScroll: {
    paddingBottom: 5,
  },
  quickResponseButton: {
    backgroundColor: '#F0EDFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    shadowColor: '#8E7AD2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  quickResponseText: {
    color: '#5A4A95',
    fontSize: 14,
  },
  inputContainer: { 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#E8E6F3', 
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15, // Increased padding since paperclip was removed
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    padding: 8, 
    maxHeight: 120,
    color: '#333',
  },
  sendButton: { 
    padding: 10, 
    borderRadius: 50,
    marginLeft: 5,
  },
  sendButtonActive: { 
    backgroundColor: '#A990FF',
  },
});

export default ChatbotScreen;