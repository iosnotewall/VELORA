import React, { useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'navy' | 'blue' | 'white' | 'outline';
  style?: ViewStyle;
}

export default function PrimaryButton({ title, onPress, disabled = false, variant = 'navy', style }: PrimaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const bgColor = variant === 'navy' ? Colors.navy
    : variant === 'blue' ? Colors.blue
    : variant === 'white' ? Colors.white
    : 'transparent';

  const textColor = variant === 'outline' ? Colors.navy
    : variant === 'white' ? Colors.navy
    : Colors.white;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
        style={[
          styles.button,
          { backgroundColor: bgColor },
          variant === 'outline' && styles.outline,
          disabled && styles.disabled,
        ]}
        testID="primary-button"
      >
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 32,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.navy,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
