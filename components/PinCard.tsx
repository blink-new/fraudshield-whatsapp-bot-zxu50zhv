import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, pulse, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';

interface PinData {
  pin: string;
  amount?: string;
  customer?: string;
}

interface PinCardProps {
  data: PinData;
}

export function PinCard({ data }: PinCardProps) {
  const [copied, setCopied] = useState(false);
  const pulseValue = useSharedValue(1);

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(data.pin);
      setCopied(true);
      
      // Pulse animation
      pulseValue.value = withRepeat(withTiming(1.1, { duration: 200 }), 2, true);
      
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied!', 'PIN copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy PIN');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  return (
    <Animated.View
      style={styles.card}
      entering={FadeInDown.duration(400)}
    >
      <View style={styles.header}>
        <Ionicons name="key" size={24} color="#25D366" />
        <Text style={styles.title}>Secure Release PIN</Text>
      </View>

      {data.customer && (
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Customer:</Text>
          <Text style={styles.orderValue}>{data.customer}</Text>
        </View>
      )}

      {data.amount && (
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Amount:</Text>
          <Text style={styles.orderValue}>{data.amount}</Text>
        </View>
      )}

      <Animated.View style={[styles.pinContainer, animatedStyle]}>
        <Text style={styles.pinLabel}>Driver PIN:</Text>
        <TouchableOpacity
          style={styles.pinButton}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Text style={styles.pinText}>{data.pin}</Text>
          <Ionicons
            name={copied ? 'checkmark' : 'copy'}
            size={20}
            color="#FFFFFF"
            style={styles.copyIcon}
          />
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.instructions}>
        Share this PIN only when handing over goods to the driver.
      </Text>

      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={16} color="#25D366" />
        <Text style={styles.securityText}>
          This PIN expires in 24 hours for security
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share" size={16} color="#128C7E" />
          <Text style={styles.actionText}>Share PIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="time" size={16} color="#128C7E" />
          <Text style={styles.actionText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: '#25D366',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  pinButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pinText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  copyIcon: {
    marginLeft: 12,
  },
  instructions: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#25D366',
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#128C7E',
  },
  actionText: {
    fontSize: 14,
    color: '#128C7E',
    marginLeft: 4,
    fontWeight: '500',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
});