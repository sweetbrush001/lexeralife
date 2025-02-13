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

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Lexera Bot. How can I help you today?",
      isBot: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const newMessages = [
      ...messages,
      {
        id: messages.length + 1,
        text: inputText,
        isBot: false,
      },
    ];
    setMessages(newMessages);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          id: messages.length + 2,
          text: "I understand you're asking about '" + inputText + "'. Let me help you with that.",
          isBot: true,
        },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../../assets/background.png')} // Replace with your background image path
        style={styles.backgroundImage}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="chevron-left" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.botInfo}>
            <View style={styles.botIconContainer}>
              <Icon name="robot" size={20} color="#A990FF" />
            </View>
            <Text style={styles.botName}>Lexera Bot</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="ellipsis-v" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isBot ? styles.botMessageWrapper : styles.userMessageWrapper,
              ]}
            >
              {message.isBot && (
                <View style={styles.botAvatar}>
                  <Icon name="robot" size={16} color="#A990FF" />
                </View>
              )}
              <View
                style={[
                  styles.message,
                  message.isBot ? styles.botMessage : styles.userMessage,
                ]}
              >
                <Text style={[styles.messageText, message.isBot ? styles.botMessageText : styles.userMessageText]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="paperclip" size={20} color="#666" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Icon
                name="paper-plane"
                size={20}
                color={inputText.trim() ? "#fff" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background for the header
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  message: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  botMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  userMessage: {
    backgroundColor: '#A990FF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#A990FF',
  },
});

export default ChatbotScreen;
