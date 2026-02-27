import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  ctaText: string;
  ctaEnabled?: boolean;
  onCta: () => void;
  showBack?: boolean;
  hideHeader?: boolean;
  secondaryAction?: { text: string; onPress: () => void };
}

export default function OnboardingScreen({
  step,
  totalSteps,
  children,
  ctaText,
  ctaEnabled = true,
  onCta,
  showBack = true,
  hideHeader = false,
  secondaryAction,
}: OnboardingScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / totalSteps,
      duration: 400,
      useNativeDriver: false,
    }).start();

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [step, totalSteps, progressAnim, contentAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!hideHeader && (
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
              <ChevronLeft size={24} color={Colors.navy} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.backPlaceholder} />
        </View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        {children}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton
          title={ctaText}
          onPress={onCta}
          disabled={!ctaEnabled}
        />
        {secondaryAction && (
          <TouchableOpacity onPress={secondaryAction.onPress} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{secondaryAction.text}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backPlaceholder: {
    width: 36,
    height: 36,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 100,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.blue,
    borderRadius: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  secondaryButton: {
    alignItems: 'center' as const,
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    textDecorationLine: 'underline' as const,
  },
});
