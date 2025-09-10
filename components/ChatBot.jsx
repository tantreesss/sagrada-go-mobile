import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: `# Welcome to SagradaGo Parish Information System!\n\nI can help you with:\n\n- • Mass schedules and events\n- • Parish activities and programs\n- • Sacramental services\n- • Donations and offerings\n- • General parish information\n\nHow may I assist you today?` }]
    }
  ]);

  // Function to clear error messages from chat history
  const clearErrorMessages = () => {
    setMessages(prev => prev.filter(msg => 
      !msg.parts[0].text.includes('Error:') && 
      !msg.parts[0].text.includes('Cannot connect')
    ));
  };
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  // Server configuration - can be easily changed for different environments
  const SERVER_CONFIG = {
    // Try multiple possible server addresses
    addresses: [
      'http://192.168.1.12:5001',  // Your current network IP
      'http://localhost:5001',      // Local development
      'http://10.0.2.2:5001',      // Android emulator
      'http://127.0.0.1:5001',     // Localhost alternative
    ],
    timeout: 5000, // 5 second timeout
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]);

  // Function to find a working server address
  const findWorkingServer = async () => {
    for (const address of SERVER_CONFIG.addresses) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SERVER_CONFIG.timeout);
        
        const response = await fetch(`${address}/api/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`[Chatbot Debug] Found working server at: ${address}`);
          return address;
        }
      } catch (error) {
        console.log(`[Chatbot Debug] Server ${address} not available:`, error.message);
      }
    }
    throw new Error('No working server found');
  };

  const toggleChat = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('[Chatbot Debug] Sending message', inputText);

      // Add user message to chat
      const userMessage = {
        role: 'user',
        parts: [{ text: inputText }]
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText(''); // Clear input after sending

      // Build conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }]
      }));

      // Find working server address
      const serverAddress = await findWorkingServer();
      console.log(`[Chatbot Debug] Using server: ${serverAddress}`);
      
      // Clear any previous errors since we found a working server
      setError(null);
      clearErrorMessages();

      // Make API request
      const response = await fetch(`${serverAddress}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText, history }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Chatbot Debug] Server error:', errorData);
        throw new Error(errorData.error || 'Failed to process message');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        role: 'model',
        parts: [{ text: data.response || data.reply || 'I apologize, but I received an empty response. Please try again.' }]
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('[Chatbot Debug] Error occurred', error);
      let errorMessage = error.message;
      
      if (error.message === 'Failed to fetch' || error.message === 'No working server found') {
        errorMessage = 'Cannot connect to any server. Please make sure the server is running and accessible from your network.';
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorResponse = {
        role: 'model',
        parts: [{ text: `Error: ${errorMessage}` }]
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.headerText}>Parish Assistant</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearErrorMessages} style={styles.clearButton}>
              <Ionicons name="refresh" size={20} color="#6B5F32" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B5F32" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Markdown style={styles.markdown}>
                {message.parts[0].text}
              </Markdown>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007bff" />
                <Text style={styles.loadingText}>Assistant is typing...</Text>
              </View>
            </View>
          )}
          {error && (
            <View style={[styles.messageBubble, styles.errorMessage]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>

      {!isOpen && (
        <TouchableOpacity style={styles.chatButton} onPress={toggleChat}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.chatButtonText}>Ask AI Parish Assistant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 1000,
  },
  chatButton: {
    backgroundColor: '#E1D5B8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 8,
  },
  chatButtonText: {
    color: '#6B5F32',
    fontSize: 14,
    fontWeight: '600',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 350,
    height: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E1D5B8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B5F32',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#E1D5B8',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e3e3e3',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#333',
    fontSize: 16,
  },
  markdown: {
    body: {
      color: '#333',
      fontSize: 16,
    },
    heading1: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    heading2: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    paragraph: {
      marginBottom: 8,
    },
    list_item: {
      marginBottom: 4,
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#E1D5B8',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBot; 