import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// datos
const GREEN = '#00a63e';
const API_KEY = 'VF.DM.692fd4fcf3a255a2a2446923.rtlXKr011uGSQ391';
const PROJECT_ID = '692e2eedbf6fe4e7b6d06a53';

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface VoiceflowChatProps {
  onClose?: () => void;
}

export default function VoiceflowChat({ onClose }: VoiceflowChatProps = {}) {
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
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  // Si onClose está definido, abrir automáticamente
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  return (
    <>
      {/* Botón flotante - solo mostrar si no hay onClose */}
      {!onClose && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </TouchableOpacity>
      )}

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
          {/* Header con logo y nombre */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>Ecobot</Text>
                <Text style={styles.headerSubtitle}>Tu Asistente Virtual</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#fff" />
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
              <View key={index} style={styles.messageWrapper}>
                {msg.type === 'bot' && (
                  <View style={styles.botAvatarContainer}>
                    <Image 
                      source={require('@/assets/logo.png')} 
                      style={styles.botAvatar}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <View
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
              </View>
            ))}
            {isLoading && (
              <View style={styles.messageWrapper}>
                <View style={styles.botAvatarContainer}>
                  <Image 
                    source={require('@/assets/logo.png')} 
                    style={styles.botAvatar}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={GREEN} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
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
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Powered by Voiceflow */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Voiceflow</Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 90,
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: GREEN,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  botAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  botAvatar: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: GREEN,
    marginLeft: 'auto',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8e8e8',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  loadingContainer: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 8,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  footer: {
    paddingVertical: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
});
