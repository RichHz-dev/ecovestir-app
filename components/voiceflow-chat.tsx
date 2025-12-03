import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GREEN = '#00a63e';
const API_KEY = 'VF.DM.692fd4fcf3a255a2a2446923.rtlXKr011uGSQ391';
const PROJECT_ID = '692e2eedbf6fe4e7b6d06a53';

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function VoiceflowChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userID, setUserID] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setUserID(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://general-runtime.voiceflow.com/state/user/${userID}/interact?logs=off`, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          config: {
            tts: false,
            stripSSML: true,
            stopAll: true,
            excludeTypes: ['block', 'debug', 'flow']
          },
          state: {
            variables: {}
          },
          request: {
            type: 'launch',
            platform: 'mobile',
            payload: {}
          }
        })
      });

      const data = await response.json();
      console.log('Voiceflow launch response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        processVoiceflowResponse(data);
      } else {
        setMessages([{ type: 'bot', text: '¡Hola! Soy tu asistente virtual de EcoVestir. ¿En qué puedo ayudarte?', timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setMessages([{ type: 'bot', text: '¡Hola! Soy tu asistente virtual de EcoVestir. ¿En qué puedo ayudarte?', timestamp: new Date() }]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0 && userID) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userID]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://general-runtime.voiceflow.com/state/user/${userID}/interact?logs=off`, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          config: {
            tts: false,
            stripSSML: true,
            stopAll: true,
            excludeTypes: ['block', 'debug', 'flow']
          },
          state: {
            variables: {}
          },
          request: {
            type: 'text',
            platform: 'mobile',
            payload: messageToSend
          }
        })
      });

      const data = await response.json();
      console.log('Voiceflow message response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        processVoiceflowResponse(data);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?', 
          timestamp: new Date() 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Lo siento, hubo un error. Por favor intenta de nuevo.', 
        timestamp: new Date() 
      }]);
    }
    setIsLoading(false);
  };

  const processVoiceflowResponse = (data: any[]) => {
    const botMessages: Message[] = [];
    
    data.forEach((trace: any) => {
      if (trace.type === 'text' || trace.type === 'speak') {
        const message = trace.payload?.message || 
                       trace.payload?.slate?.content?.[0]?.children?.[0]?.text || '';
        if (message) {
          botMessages.push({
            type: 'bot',
            text: message,
            timestamp: new Date()
          });
        }
      }
    });

    if (botMessages.length > 0) {
      setMessages(prev => [...prev, ...botMessages]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages([]);
    }, 300);
  };

  return (
    <>
      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal con el chat */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Asistente Virtual</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.type === 'user' ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.type === 'user' ? styles.userText : styles.botText
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={GREEN} />
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: GREEN,
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: GREEN,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    padding: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
