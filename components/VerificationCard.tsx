import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface VerificationData {
  status: 'verified' | 'suspicious';
  amount?: string;
  message: string;
}

interface VerificationCardProps {
  data: VerificationData;
}

export function VerificationCard({ data }: VerificationCardProps) {
  const isVerified = data.status === 'verified';

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: isVerified ? '#E8F5E8' : '#FFE8E8' }
      ]}
      entering={FadeInDown.duration(400)}
    >
      <View style={styles.header}>
        <Ionicons
          name={isVerified ? 'checkmark-circle' : 'warning'}
          size={24}
          color={isVerified ? '#25D366' : '#FF4444'}
        />
        <Text style={[
          styles.status,
          { color: isVerified ? '#25D366' : '#FF4444' }
        ]}>
          {isVerified ? 'Verified' : 'Suspicious'}
        </Text>
      </View>

      {data.amount && (
        <Text style={styles.amount}>{data.amount}</Text>
      )}

      <Text style={styles.message}>{data.message}</Text>

      {isVerified && (
        <View style={styles.successBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#25D366" />
          <Text style={styles.successText}>Safe to proceed</Text>
        </View>
      )}

      {!isVerified && (
        <View style={styles.warningBadge}>
          <Ionicons name="alert-circle" size={16} color="#FF4444" />
          <Text style={styles.warningText}>Action required</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F4DD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  successText: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '500',
    marginLeft: 4,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD4D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '500',
    marginLeft: 4,
  },
});