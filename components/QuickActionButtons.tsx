import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface QuickActionButtonsProps {
  onAction: (action: number) => void;
}

export function QuickActionButtons({ onAction }: QuickActionButtonsProps) {
  const actions = [
    {
      id: 1,
      icon: 'card' as const,
      title: 'Verify Payment',
      subtitle: 'PoP / EFT verification',
      color: '#25D366',
    },
    {
      id: 2,
      icon: 'document-text' as const,
      title: 'Check Document',
      subtitle: 'RFQ / PO authenticity',
      color: '#128C7E',
    },
    {
      id: 3,
      icon: 'key' as const,
      title: 'Release PIN',
      subtitle: 'Generate driver PIN',
      color: '#075E54',
    },
  ];

  return (
    <Animated.View
      style={styles.container}
      entering={FadeInUp.duration(400)}
    >
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.buttonsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => onAction(action.id)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={styles.buttonContent}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                <Text style={styles.actionNumber}>{action.id}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  actionNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    color: '#333333',
    fontSize: 12,
    fontWeight: '700',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 16,
  },
});