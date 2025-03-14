import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Modal,
  FlatList,
  ToastAndroid, // Add ToastAndroid import
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
// Add Firestore imports
import { 
  collection,
  addDoc,
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import NetInfo from '@react-native-community/netinfo'; // Add this import for network detection

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
  // New states for chat history
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // Add a flag to track when we're loading messages vs adding new ones
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Add a ref to track the last message saved to Firestore to prevent duplications
  const lastSavedMessageRef = useRef(null);
  // Add a ref to store message processing state
  const processingMessageRef = useRef(false);
  // Add a ref to store conversation switching state
  const switchingConversationRef = useRef(false);
  // Add a state to track if user is authenticated
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  // Add state to prevent re-renders during deletion
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  // Add ref to track mounted state
  const isMountedRef = useRef(true);
  // Add ref for forcing refresh after conversation deletion
  const forceRefreshKey = useRef(0);
  // Add a ref to prevent multiple refreshes during deletion
  const isRefreshingRef = useRef(false);
  // Add a ref to prevent modal from reopening during deletion
  const preventModalOpenRef = useRef(false);
  // Add network state tracking
  const [isConnected, setIsConnected] = useState(true);
  // Add ref to track pending operations for cleanup
  const pendingOperationsRef = useRef([]);
  // Add ref for API request cancellation
  const apiCancelTokenRef = useRef(null);
  
  const scrollViewRef = useRef();
  const textStyle = useTextStyle();
  // Create a filtered style that excludes fontSize from the settings
  const filteredTextStyle = useMemo(() => {
    const { fontSize, ...otherStyles } = textStyle;
    return otherStyles;
  }, [textStyle]);
  
  const textReader = useTextReader();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');
  
  // Initialize auth state on component mount with improved error handling
  useEffect(() => {
    console.log("Initializing component and checking auth state...");
    
    // Track network connectivity
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        console.log("Network disconnected - operations will be queued");
      } else if (state.isConnected && !isConnected) {
        console.log("Network reconnected - resuming operations");
      }
    });
    
    // Set up auth state listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        setIsUserAuthenticated(true);
        loadConversations(user.uid);
      } else {
        console.log("No authenticated user");
        setIsUserAuthenticated(false);
      }
    });
    
    // Test Firestore connection to verify permissions
    const testFirestore = async () => {
      try {
        if (auth.currentUser) {
          console.log("Testing Firestore connection...");
          const testPath = `chatHistory/${auth.currentUser.uid}/test`;
          const testRef = collection(db, testPath);
          console.log("Firestore is accessible");
        }
      } catch (error) {
        console.error("Firestore connection test failed:", error);
      }
    };
    
    testFirestore();
    
    return () => {
      console.log("Cleaning up auth listener");
      isMountedRef.current = false;
      unsubscribeAuth();
      unsubscribeNetInfo();
      
      // Cancel pending API requests
      if (apiCancelTokenRef.current) {
        apiCancelTokenRef.current.cancel("Component unmounted");
      }
      
      // Clear any pending timeouts from refs
      pendingOperationsRef.current.forEach(clearTimeout);
      pendingOperationsRef.current = [];
    };
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // When currentConversationId changes, load that conversation's messages
  useEffect(() => {
    if (currentConversationId) {
      loadConversationMessages(currentConversationId);
    }
  }, [currentConversationId]);

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
    
    // Only save message to Firestore if it's a new message (not when loading history)
    const saveLastMessage = async () => {
      const lastMessage = messages[messages.length - 1];
      if (
        !currentConversationId || 
        !lastMessage || 
        isLoadingMessages ||
        switchingConversationRef.current ||
        lastSavedMessageRef.current === lastMessage.id ||
        lastMessage.id?.startsWith('temp-')
      ) {
        return;
      }
      
      // Check if message is not a system welcome message
      if (lastMessage.isBot && lastMessage.text === "Hi! I'm Lexera Bot. How can I help you today?") {
        return;
      }
      
      try {
        await saveMessageToFirestore(lastMessage);
        lastSavedMessageRef.current = lastMessage.id;
      } catch (error) {
        console.error("Failed to save message in effect:", error);
      }
    };
    
    if (messages.length > 0 && isConnected) {
      saveLastMessage();
    }
  }, [messages, currentConversationId, isLoadingMessages, isConnected]);
  
  // Memoize loadConversations to prevent unnecessary rerenders
  const loadConversations = useCallback(async (userId) => {
    if (!userId || isRefreshingRef.current) return;
    
    const loadId = Date.now(); // Create unique ID for this load operation
    isRefreshingRef.current = loadId; // Store the ID instead of just a boolean
    setIsLoadingHistory(true);
    
    try {
      const q = query(
        collection(db, "chatHistory", userId, "conversations"),
        orderBy("updatedAt", "desc"),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const conversationsData = [];
      
      querySnapshot.forEach((doc) => {
        conversationsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Only update state if component is still mounted
      if (isRefreshingRef.current === loadId && isMountedRef.current) {
        setConversations(conversationsData);
        
        // If we have conversations but none is selected, select the most recent one
        if (conversationsData.length > 0 && !currentConversationId) {
          setCurrentConversationId(conversationsData[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      if (isMountedRef.current) {
        if (!isConnected) {
          Alert.alert("Network Error", "Please check your internet connection");
        } else {
          Alert.alert("Error", "Failed to load chat history");
        }
      }
    } finally {
      // Only reset if this is still the current operation
      if (isRefreshingRef.current === loadId && isMountedRef.current) {
        setIsLoadingHistory(false);
        safeTimeout(() => {
          if (isRefreshingRef.current === loadId) {
            isRefreshingRef.current = false;
          }
        }, 500);
      }
    }
  }, [currentConversationId, isConnected, safeTimeout]);
  
  // Function to create a new conversation - Fixed to ensure proper creation
  const createNewConversation = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "You need to be logged in to save conversations");
      return null;
    }
    
    console.log("Creating new conversation for user:", userId);
    
    try {
      // Reset the lastSavedMessageRef when creating a new conversation
      lastSavedMessageRef.current = null;
      
      // Create a new conversation document with explicit path
      const conversationData = {
        title: "New Conversation",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log("Creating conversation with data:", conversationData);
      const conversationsCollection = collection(db, "chatHistory", userId, "conversations");
      const newConversationRef = await addDoc(conversationsCollection, conversationData);
      const newConversationId = newConversationRef.id;
      
      console.log("Created new conversation with ID:", newConversationId);
      
      // Add the welcome message
      const welcomeMessageData = {
        text: "Hi! I'm Lexera Bot. How can I help you today?",
        isBot: true,
        timestamp: serverTimestamp(),
      };
      
      const messagesCollection = collection(db, "chatHistory", userId, "conversations", newConversationId, "messages");
      const welcomeMessageRef = await addDoc(messagesCollection, welcomeMessageData);
      
      console.log("Added welcome message with ID:", welcomeMessageRef.id);
      
      // Update local state
      setCurrentConversationId(newConversationId);
      setMessages([
        { 
          id: welcomeMessageRef.id, 
          text: "Hi! I'm Lexera Bot. How can I help you today?", 
          isBot: true 
        }
      ]);
      
      // Refresh the conversations list
      loadConversations(userId);
      
      return newConversationId;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      Alert.alert("Error", "Failed to create a new conversation");
      return null;
    }
  };
  
  // Function to load messages from a specific conversation
  const loadConversationMessages = async (conversationId) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !conversationId) return;
    
    setIsLoading(true);
    setIsLoadingMessages(true); // Set the loading messages flag to true
    switchingConversationRef.current = true; // Set the switching flag to true
    
    try {
      // First verify the conversation exists
      const conversationDocRef = doc(db, "chatHistory", userId, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationDocRef);
      
      if (!conversationDoc.exists()) {
        console.log("Conversation no longer exists:", conversationId);
        // Handle deleted conversation - switch to another one or create new state
        const availableConversations = await getDocs(
          query(
            collection(db, "chatHistory", userId, "conversations"),
            orderBy("updatedAt", "desc"),
            limit(1)
          )
        );
        
        if (!availableConversations.empty) {
          // Switch to another conversation
          const newConversationId = availableConversations.docs[0].id;
          if (newConversationId !== conversationId) {
            setCurrentConversationId(newConversationId);
            return; // Exit this function as we'll re-enter with new ID
          }
        } else {
          // No conversations available, reset to initial state
          setCurrentConversationId(null);
          setMessages([
            { id: `welcome-message-${Date.now()}`, text: "Hi! I'm Lexera Bot. How can I help you today?", isBot: true }
          ]);
          setIsLoading(false);
          setIsLoadingMessages(false);
          switchingConversationRef.current = false;
          return; // Exit early
        }
      }
      
      const q = query(
        collection(db, "chatHistory", userId, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const messagesData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id, // Use the Firestore document ID as the message ID
          text: data.text,
          isBot: data.isBot,
          timestamp: data.timestamp?.toDate?.() || new Date(), // Convert Firebase timestamp to Date
        });
      });
      
      // If we have messages, update the lastSavedMessageRef to the last message ID
      if (messagesData.length > 0) {
        lastSavedMessageRef.current = messagesData[messagesData.length - 1].id;
      } else {
        lastSavedMessageRef.current = null;
      }
      
      // Use a consistent welcome message ID across different functions
      const welcomeMessage = { 
        id: 'welcome-message-' + conversationId, 
        text: "Hi! I'm Lexera Bot. How can I help you today?", 
        isBot: true 
      };
      
      setMessages(messagesData.length > 0 ? messagesData : [welcomeMessage]);
      
      // Update the conversation title if it's "New Conversation" and we have user messages
      const userMessages = messagesData.filter(msg => !msg.isBot);
      if (userMessages.length > 0) {
        const conversationDoc = await getDoc(doc(db, "chatHistory", userId, "conversations", conversationId));
        if (conversationDoc.exists() && conversationDoc.data().title === "New Conversation") {
          // Use the first user message as the title (limited to 30 chars)
          const title = userMessages[0].text.substring(0, 30) + (userMessages[0].text.length > 30 ? "..." : "");
          await updateDoc(doc(db, "chatHistory", userId, "conversations", conversationId), {
            title: title
          });
          
          // Update in local state too
          setConversations(prev => prev.map(conv => 
            conv.id === conversationId ? {...conv, title} : conv
          ));
        }
      }
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      Alert.alert("Error", "Failed to load conversation");
      setMessages([{ 
        id: 'welcome-message', 
        text: "Hi! I'm Lexera Bot. How can I help you today?", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
      // Set the flags back to false after a brief delay to ensure state updates properly
      setTimeout(() => {
        setIsLoadingMessages(false);
        switchingConversationRef.current = false;
      }, 300);
    }
  };
  
  // Completely rewritten saveMessageToFirestore function for reliability
  const saveMessageToFirestore = async (message) => {
    // Double-check we have all prerequisites
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn("Cannot save message - user not authenticated");
      return null;
    }
    
    if (!currentConversationId) {
      console.warn("Cannot save message - no active conversation");
      return null;
    }
    
    if (!message || !message.text) {
      console.warn("Cannot save message - invalid message");
      return null;
    }
    
    // Avoid saving welcome messages (they're added during conversation creation)
    if (message.isBot && message.text === "Hi! I'm Lexera Bot. How can I help you today?") {
      console.log("Skipping save for welcome message");
      return null;
    }
    
    console.log(`Saving message to Firestore for conversation: ${currentConversationId}`);
    console.log(`Message preview: ${message.text.substring(0, 20)}...`);
    
    try {
      // Create message data
      const messageData = {
        text: message.text,
        isBot: message.isBot,
        timestamp: serverTimestamp(),
      };
      
      // Get reference to messages collection
      const messagesCollection = collection(
        db, 
        "chatHistory", 
        userId, 
        "conversations", 
        currentConversationId, 
        "messages"
      );
      
      // Add the document
      const messageRef = await addDoc(messagesCollection, messageData);
      console.log("Successfully saved message with ID:", messageRef.id);
      
      // Update the message ID in local state
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, id: messageRef.id } : msg
      ));
      
      // Update the last saved message reference
      lastSavedMessageRef.current = messageRef.id;
      
      // Update conversation's updatedAt timestamp
      const conversationRef = doc(db, "chatHistory", userId, "conversations", currentConversationId);
      await updateDoc(conversationRef, { updatedAt: serverTimestamp() });
      
      // If this is a user message, it might be the first one, so update the title
      if (!message.isBot) {
        const userMessages = messages.filter(m => !m.isBot);
        if (userMessages.length === 1 || (userMessages.length > 0 && userMessages[0].id === message.id)) {
          const title = message.text.substring(0, 30) + (message.text.length > 30 ? "..." : "");
          await updateDoc(conversationRef, { title });
          
          setConversations(prev => prev.map(conv => 
            conv.id === currentConversationId ? {...conv, title} : conv
          ));
        }
      }
      
      return messageRef.id;
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
      console.error("Error details:", JSON.stringify({
        code: error.code,
        message: error.message
      }));
      return null;
    }
  };

  // Function to send a message through text input
  const handleSend = async () => {
    if (!inputText.trim() || processingMessageRef.current) return;
    
    // If no conversation exists and user is authenticated, create one
    if (!currentConversationId && auth.currentUser) {
      console.log("No active conversation - creating new one before sending message");
      const newConversationId = await createNewConversation();
      if (!newConversationId) {
        Alert.alert("Error", "Could not create a new conversation. Please try again.");
        return;
      }
    }
    
    await sendMessage(inputText);
  };

  // Handle quick response selection
  const handleQuickResponse = async (response) => {
    // Create a new conversation if one doesn't exist
    if (!currentConversationId) {
      const newConversationId = await createNewConversation();
      if (!newConversationId) return;
    }
    
    await sendMessage(response);
  };

  // Modified sendMessage function with improved conversation handling
  const sendMessage = async (text) => {
    if (processingMessageRef.current) return;
    processingMessageRef.current = true;
    
    // Check for network connectivity first
    if (!isConnected) {
      Alert.alert(
        "No Internet Connection", 
        "You're offline. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
      processingMessageRef.current = false;
      return;
    }
    
    // Check authentication
    if (!auth.currentUser) {
      console.warn("Not authenticated - attempting to continue without saving");
    }
    
    try {
      // Create a new conversation if needed
      if (!currentConversationId && auth.currentUser) {
        console.log("No active conversation - creating new one");
        const newConversationId = await createNewConversation();
        if (!newConversationId) {
          console.error("Failed to create conversation");
          processingMessageRef.current = false;
          return;
        }
      }
      
      // Generate a unique temporary ID for this message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const userMessage = { id: tempId, text: text, isBot: false };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);
      
      // If we have a conversation ID, try to save the user message immediately
      if (currentConversationId && auth.currentUser) {
        console.log("Saving user message to conversation:", currentConversationId);
        await saveMessageToFirestore(userMessage).catch(err => 
          console.error("Error saving user message:", err)
        );
      }
    
      // Create a cancel token for the API request
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      apiCancelTokenRef.current = source;
      
      const response = await axios.post(
        GEMINI_API_URL, 
        {
          contents: [{
            role: "user",
            parts: [{ text: text }]
          }]
        }, 
        {
          headers: { 'Content-Type': 'application/json' },
          cancelToken: source.token,
          timeout: 30000 // Add 30s timeout
        }
      );
      
      // Clear the cancel token reference
      apiCancelTokenRef.current = null;
    
      const botResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that.";
      
      // Generate another unique tempId for bot message
      const botTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const botMessage = { id: botTempId, text: botResponse, isBot: true };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Also save the bot message if we have a conversation
      if (currentConversationId && auth.currentUser) {
        await saveMessageToFirestore(botMessage).catch(err => 
          console.error("Error saving bot response:", err)
        );
      }
    } catch (error) {
      console.error('Error in sendMessage flow:', error);
      
      // Handle axios cancellation gracefully
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        setMessages((prev) => [...prev, { 
          id: `error-${Date.now()}`, 
          text: 'Operation canceled.', 
          isBot: true 
        }]);
      } else if (!isConnected) {
        Alert.alert("Network Error", "You're offline. Please check your internet connection and try again.");
      } else if (error.response) {
        Alert.alert("API Error", `Error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert("Timeout", "The request took too long to complete. Please try again.");
      } else {
        Alert.alert("Error", "There was a problem connecting to the server. Please try again later.");
      }
      
      const errorTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setMessages((prev) => [...prev, { 
        id: errorTempId, 
        text: 'Error: Unable to fetch response.', 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
      processingMessageRef.current = false;
    }
  };

  // Function to start a new chat
  const startNewChat = async () => {
    if (processingMessageRef.current) return;
    
    const newConversationId = await createNewConversation();
    if (newConversationId) {
      setShowHistoryModal(false);
      // The new conversation creation already sets the messages to the welcome message
    }
  };
  
  // Optimize switchConversation function with check for deletion in progress
  const switchConversation = useCallback((conversationId) => {
    // Prevent switching during deletion
    if (isDeletingConversation) return;
    
    if (currentConversationId === conversationId) {
      // Already on this conversation, just close the modal
      setShowHistoryModal(false);
      return;
    }
    
    // Reset the lastSavedMessageRef when switching conversations
    lastSavedMessageRef.current = null;
    switchingConversationRef.current = true;
    
    setCurrentConversationId(conversationId);
    setShowHistoryModal(false);
  }, [currentConversationId, isDeletingConversation]);
  
  // Combine the message style with the filtered text style from settings
  const getBotMessageStyle = useMemo(() => {
    return {
      ...styles.botMessageText,
      ...filteredTextStyle, // Apply everything except fontSize
    };
  }, [filteredTextStyle]);

  const getUserMessageStyle = useMemo(() => {
    return {
      ...styles.userMessageText,
      ...filteredTextStyle, // Apply everything except fontSize
    };
  }, [filteredTextStyle]);

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
            style={message.isBot ? getBotMessageStyle : getUserMessageStyle} 
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
    
    // Apply filtered style to quick response text
    const quickResponseTextStyle = {
      ...styles.quickResponseText,
      ...filteredTextStyle,
    };
    
    return (
      <View style={styles.quickResponsesContainer}>
        <ReadableText 
          style={{...styles.quickResponsesTitle, ...filteredTextStyle}} 
          readable={true} 
          priority={messages.length + 1}
        >
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
                style={quickResponseTextStyle} 
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

  // Chat History Modal Component with optimized rendering
  const ChatHistoryModal = () => {
    return (
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isDeletingConversation && setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ReadableText style={styles.modalTitle} readable={true}>
                Chat History
              </ReadableText>
              
              <View style={styles.modalActions}>
                {/* Add refresh button */}
                <TouchableOpacity 
                  onPress={refreshConversations}
                  style={styles.refreshButton}
                  disabled={isLoadingHistory || isDeletingConversation}
                  accessibilityLabel="Refresh conversations"
                >
                  <Icon 
                    name="sync" 
                    size={18} 
                    color={isLoadingHistory || isDeletingConversation ? "#CCC" : "#666"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => !isDeletingConversation && setShowHistoryModal(false)}
                  style={styles.closeButton}
                  disabled={isDeletingConversation}
                >
                  <Icon name="times" size={20} color={isDeletingConversation ? "#CCC" : "#666"} />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.newChatButton,
                isDeletingConversation && styles.disabledButton
              ]}
              onPress={startNewChat}
              disabled={isDeletingConversation || processingMessageRef.current}
            >
              <Icon name="plus-circle" size={18} color={isDeletingConversation ? "#CCC" : "#A990FF"} />
              <ReadableText 
                style={[
                  styles.newChatText,
                  isDeletingConversation && styles.disabledText
                ]} 
                readable={true}
              >
                New Conversation
              </ReadableText>
            </TouchableOpacity>
            
            {(isLoadingHistory || isDeletingConversation) ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#A990FF" style={styles.loader} />
                {isDeletingConversation && (
                  <ReadableText style={styles.loadingText} readable={true}>
                    Deleting conversation...
                  </ReadableText>
                )}
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversationItem}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <ReadableText style={styles.emptyListText} readable={true}>
                      No conversations found. Start a new chat!
                    </ReadableText>
                  </View>
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => ({
                  length: 50, // Approximate height of each item
                  offset: 50 * index,
                  index,
                })}
              />
            )}
          </View>
        </View>
      </Modal>
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

  // Add a function to delete a conversation and all its messages
  const deleteConversation = async (conversationId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "You need to be logged in to delete conversations");
      return;
    }
    
    // Network check
    if (!isConnected) {
      Alert.alert("No Internet Connection", "You're offline. Please check your internet connection and try again.");
      return;
    }
    
    // Prevent multiple delete operations
    if (isDeletingConversation) return;
    
    // Store whether we're deleting the current conversation
    const isDeletingCurrentConversation = currentConversationId === conversationId;
    // Get a local copy of conversations to work with throughout the operation
    const currentConversationsList = [...conversations];
    
    // Close history modal immediately to prevent refresh cycles
    if (showHistoryModal) {
      setShowHistoryModal(false);
      // Flag to prevent modal from reopening during deletion process
      preventModalOpenRef.current = true;
    }
    
    // Set deletion state
    setIsDeletingConversation(true);
    setIsLoadingHistory(true);
    
    try {
      // First, get all messages for this conversation
      const messagesRef = collection(db, "chatHistory", userId, "conversations", conversationId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);
      
      // Delete each message in batches to improve performance
      const deletionPromises = [];
      const BATCH_SIZE = 10;
      
      // Process in smaller batches
      for (let i = 0; i < messagesSnapshot.docs.length; i += BATCH_SIZE) {
        const batch = messagesSnapshot.docs.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(messageDoc => 
          deleteDoc(doc(db, "chatHistory", userId, "conversations", conversationId, "messages", messageDoc.id))
            .catch(err => {
              console.error(`Failed to delete message ${messageDoc.id}:`, err);
              return null;
            })
        );
        deletionPromises.push(Promise.all(batchPromises));
      }
      
      await Promise.all(deletionPromises);
      
      // Delete the conversation document
      await deleteDoc(doc(db, "chatHistory", userId, "conversations", conversationId));
      console.log("Conversation deleted successfully:", conversationId);
      
      // First update state to remove the deleted conversation
      const updatedConversations = currentConversationsList.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      
      // Flag to prevent auto-refresh from triggering during this process
      isRefreshingRef.current = true;
      
      // If we deleted the current conversation, handle switching
      if (isDeletingCurrentConversation) {
        // Reset these values immediately to prevent stale references
        lastSavedMessageRef.current = null;
        switchingConversationRef.current = true;
        
        if (updatedConversations.length > 0) {
          // Set messages to empty first to prevent stale display
          setMessages([]);
          
          // Then set the new conversation after a short delay
          const nextConversation = updatedConversations[0];
          console.log(`Switching from deleted conversation to: ${nextConversation.id}`);
          
          // Use a single timeout to handle all state changes together
          setTimeout(() => {
            if (isMountedRef.current) {
              setCurrentConversationId(nextConversation.id);
              // Force UI update in the same cycle
              forceRefreshKey.current += 1;
              
              // Allow refreshing again after state updates are complete
              setTimeout(() => {
                isRefreshingRef.current = false;
              }, 500);
            }
          }, 300);
        } else {
          // No conversations left, reset state completely
          setCurrentConversationId(null);
          setMessages([
            { 
              id: `welcome-message-${Date.now()}`, 
              text: "Hi! I'm Lexera Bot. How can I help you today?", 
              isBot: true 
            }
          ]);
          
          // Allow refreshing again after state updates are complete
          setTimeout(() => {
            isRefreshingRef.current = false;
            forceRefreshKey.current += 1;
          }, 500);
        }
      } else {
        // If not deleting current conversation, just allow refreshing after a delay
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 500);
      }
      
      // Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.show('Conversation deleted successfully', ToastAndroid.SHORT);
      } else if (Platform.OS === 'ios') {
        Alert.alert("Success", "Conversation deleted successfully", 
          [{ text: "OK" }], 
          { cancelable: true }
        );
      } else {
        console.log("Conversation deleted successfully");
      }
      
    } catch (error) {
      console.error("Error deleting conversation:", error);
      if (isMountedRef.current) {
        Alert.alert("Error", "Failed to delete conversation");
      }
    } finally {
      // Allow a delay before resetting loading states to ensure all updates are processed
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoadingHistory(false);
          setIsDeletingConversation(false);
          
          // Reset the modal prevention flag after deletion process is complete
          setTimeout(() => {
            preventModalOpenRef.current = false;
          }, 1000);
          
          // FIX: Use updatedConversations length instead of conversations.length
          const updatedLength = currentConversationsList.length - 1;
          
          // If we deleted the current conversation and there are no other conversations,
          // offer to create a new one
          if (isDeletingCurrentConversation && updatedLength === 0) {
            setTimeout(() => {
              if (isMountedRef.current) {
                Alert.alert(
                  "No conversations left",
                  "Would you like to start a new chat?",
                  [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: startNewChat }
                  ]
                );
              }
            }, 500);
          }
        }
      }, 300);
    }
  };

  // Optimize the confirm delete dialog
  const confirmDelete = useCallback((conversationId, title) => {
    // Prevent dialog from showing during deletion
    if (isDeletingConversation) return;
    
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteConversation(conversationId),
          style: "destructive"
        }
      ]
    );
  }, [isDeletingConversation]);

  // Optimize the render of conversation items for better performance
  const renderConversationItem = useCallback(({ item }) => (
    <View style={styles.conversationItemContainer}>
      <TouchableOpacity 
        style={[
          styles.conversationItem,
          currentConversationId === item.id && styles.activeConversation
        ]}
        onPress={() => switchConversation(item.id)}
        disabled={isDeletingConversation}
      >
        <Icon 
          name="comment-alt" 
          size={18} 
          color={currentConversationId === item.id ? "#A990FF" : "#888"} 
        />
        <ReadableText 
          style={[
            styles.conversationTitle,
            currentConversationId === item.id && styles.activeConversationText
          ]} 
          readable={true}
          numberOfLines={1}
        >
          {item.title}
        </ReadableText>
        <Text style={styles.conversationDate}>
          {item.updatedAt?.toDate ? 
            new Date(item.updatedAt.toDate()).toLocaleDateString() : 
            "Just now"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id, item.title)}
        disabled={isDeletingConversation}
      >
        <Icon 
          name="trash-alt" 
          size={16} 
          color={isDeletingConversation ? "#CCC" : "#FF6B6B"} 
        />
      </TouchableOpacity>
    </View>
  ), [currentConversationId, isDeletingConversation, confirmDelete, switchConversation]);

  // Add a manual refresh function
  const refreshConversations = useCallback(async () => {
    if (!auth.currentUser?.uid || isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsLoadingHistory(true);
    
    try {
      await loadConversations(auth.currentUser.uid);
      
      // If we have a currentConversationId, reload its messages
      if (currentConversationId) {
        await loadConversationMessages(currentConversationId);
      }
      
      // Force refresh the UI
      forceRefreshKey.current += 1;
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setIsLoadingHistory(false);
      // Add a slight delay before allowing new refreshes
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 500);
    }
  }, [currentConversationId, loadConversations]);
  
  // Update history button to respect the preventModalOpen flag
  const openHistoryModal = useCallback(() => {
    if (!preventModalOpenRef.current) {
      setShowHistoryModal(true);
    }
  }, []);

  // Safe timeout function that tracks pending operations
  const safeTimeout = useCallback((callback, delay) => {
    if (!isMountedRef.current) return null;
    
    const timeoutId = setTimeout(() => {
      // Remove this operation from pending list when executed
      pendingOperationsRef.current = pendingOperationsRef.current.filter(id => id !== timeoutId);
      
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    
    // Add to pending operations
    pendingOperationsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  // Extract post-deletion logic to a separate function for clarity
  const handlePostDeletion = useCallback((updatedConversations, wasCurrentConversation) => {
    // Flag to prevent auto-refresh during this process
    isRefreshingRef.current = true;
    
    if (wasCurrentConversation) {
      // Reset values to prevent stale references
      lastSavedMessageRef.current = null;
      switchingConversationRef.current = true;
      
      if (updatedConversations.length > 0) {
        // Clear messages first
        setMessages([]);
        
        // Set new conversation after a delay
        safeTimeout(() => {
          if (isMountedRef.current) {
            const nextConversation = updatedConversations[0];
            setCurrentConversationId(nextConversation.id);
            forceRefreshKey.current += 1;
            
            // Allow refreshing again after state updates
            safeTimeout(() => {
              isRefreshingRef.current = false;
            }, 500);
          }
        }, 300);
      } else {
        // No conversations left
        setCurrentConversationId(null);
        setMessages([{ 
          id: `welcome-message-${Date.now()}`, 
          text: "Hi! I'm Lexera Bot. How can I help you today?", 
          isBot: true 
        }]);
        
        safeTimeout(() => {
          forceRefreshKey.current += 1;
          isRefreshingRef.current = false;
          
          // Offer to create new conversation if none left
          if (updatedConversations.length === 0) {
            safeTimeout(() => {
              if (isMountedRef.current) {
                Alert.alert(
                  "No conversations left",
                  "Would you like to start a new chat?",
                  [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: startNewChat }
                  ]
                );
              }
            }, 500);
          }
        }, 500);
      }
    } else {
      // If not deleting current conversation
      safeTimeout(() => {
        isRefreshingRef.current = false;
      }, 500);
    }
  }, [safeTimeout]);

  // Memoize the conversation list to avoid unnecessary re-renders
  const memoizedConversations = useMemo(() => conversations, [conversations]);

  // Network status display component
  const NetworkStatus = () => {
    if (isConnected) return null;
    
    return (
      <View style={styles.networkStatusContainer}>
        <Icon name="wifi-slash" size={14} color="#FFF" />
        <Text style={styles.networkStatusText}>You're offline</Text>
      </View>
    );
  };

  // Optimize scrolling with deferred state updates
  const updateScrollPosition = useCallback(() => {
    if (scrollViewRef.current) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, []);

  return (
    <TextReaderProvider>
      <SafeAreaView 
        style={[styles.container, { paddingTop: insets.top }]} 
        key={`chat-screen-${forceRefreshKey.current}`}
      >
        <ImageBackground 
          source={require('../../../assets/background.png')} 
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.8 }}
        >
          {/* Show network status */}
          <NetworkStatus />
          
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
            {/* Update history button to use openHistoryModal */}
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={openHistoryModal}
              accessibilityLabel="Chat history"
              accessibilityHint="Opens your previous conversations"
              disabled={preventModalOpenRef.current || isDeletingConversation}
            >
              <Icon name="history" size={22} color={preventModalOpenRef.current ? "#CCC" : "#666"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={updateScrollPosition}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
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
                style={[styles.input, filteredTextStyle]} // Use filtered style here
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
          
          {/* Chat History Modal */}
          <ChatHistoryModal />
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
  historyButton: {
    padding: 10,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  newChatText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#5A4A95',
  },
  conversationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    flex: 1,
  },
  activeConversation: {
    backgroundColor: 'rgba(169, 144, 255, 0.1)',
    borderRadius: 8,
  },
  conversationTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  activeConversationText: {
    fontWeight: '600',
    color: '#5A4A95',
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  deleteButton: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loader: {
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 5,
  },
  networkStatusContainer: {
    backgroundColor: '#FF6B6B',
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkStatusText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default ChatbotScreen;