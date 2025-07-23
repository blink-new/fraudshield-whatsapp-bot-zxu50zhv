import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { VerificationCard } from './VerificationCard';
import { PinCard } from './PinCard';
import { EnhancedVerificationCard } from './EnhancedVerificationCard';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'verification' | 'pin' | 'document' | 'enhanced_verification';
  data?: any;
}

interface ChatMessageProps {
  message: Message;
  delay?: number;
}

export function ChatMessage({ message, delay = 0 }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'verification':
        return <VerificationCard data={message.data} />;
      case 'enhanced_verification':
        return (
          <EnhancedVerificationCard 
            data={message.data} 
            type={message.data.verificationType || 'payment'} 
          />
        );
      case 'pin':
        return <PinCard data={message.data} />;
      case 'document':
        return (
          <View style={styles.documentMessage}>
            <Ionicons name="document" size={20} color="#128C7E" />
            <Text style={styles.documentText}>{message.text}</Text>
          </View>
        );
      default:
        return (
          <Text style={[
            styles.messageText,
            { color: message.isBot ? '#000000' : '#FFFFFF' }
          ]}>
            {message.text}
          </Text>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessageContainer : styles.userMessageContainer,
      ]}
      entering={message.isBot ? FadeInLeft.delay(delay) : FadeInRight.delay(delay)}
    >
      <View
        style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        {renderMessageContent()}
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            { color: message.isBot ? '#666666' : '#B8E6D1' }
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {!message.isBot && (
            <Ionicons
              name="checkmark-done"
              size={16}
              color="#B8E6D1"
              style={styles.checkmark}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#25D366',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  checkmark: {
    marginLeft: 2,
  },
  documentMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
});