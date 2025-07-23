import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeInLeft,
} from 'react-native-reanimated';

export function TypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animateDots = () => {
      dot1.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true
      );
      
      setTimeout(() => {
        dot2.value = withRepeat(
          withTiming(1, { duration: 600 }),
          -1,
          true
        );
      }, 200);
      
      setTimeout(() => {
        dot3.value = withRepeat(
          withTiming(1, { duration: 600 }),
          -1,
          true
        );
      }, 400);
    };

    animateDots();
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
  }));

  return (
    <Animated.View
      style={styles.container}
      entering={FadeInLeft.duration(300)}
    >
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
        <Text style={styles.typingText}>FraudShield is typing...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
});