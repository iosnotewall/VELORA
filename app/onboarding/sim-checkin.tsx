import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOODS = [
  { emoji: '😔', label: 'drained', color: '#C4857A' },
  { emoji: '😐', label: 'meh', color: '#D4A853' },
  { emoji: '🙂', label: 'okay', color: '#7B8FC4' },
  { emoji: '😊', label: 'good', color: '#5A8A6F' },
  { emoji: '✨', label: 'amazing', color: '#4A90D9' },
];

export default function SimCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [moodIndex, setMoodIndex] = useState(2);
  const [autoPlaying, setAutoPlaying] = useState(true);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const sliderAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(1)).current;

  const bgColorAnim = useRef(new Animated.Value(2)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(emojiAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(sliderAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start(() => {
      setTimeout(() => {
        animateToMood(3);
        setTimeout(() => {
          animateToMood(4);
          setTimeout(() => {
            setAutoPlaying(false);
            Animated.spring(btnAnim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 140 }).start();
          }, 800);
        }, 800);
      }, 600);
    });
  }, []);

  const animateToMood = useCallback((index: number) => {
    setMoodIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.15, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(emojiScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 12, stiffness: 200 }),
      ]),
      Animated.sequence([
        Animated.timing(labelAnim, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(bgColorAnim, { toValue: index, duration: 400, useNativeDriver: false }),
    ]).start();
  }, [emojiScale, labelAnim, bgColorAnim]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-wisdom' as any);
  }, [router]);

  const currentMood = MOODS[moodIndex];

  const bgColor = bgColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['#2E1F1A', '#1F2A1E', '#1A2438', '#142E20', '#0B1A2E'],
  });

  const sliderPosition = (moodIndex / (MOODS.length - 1)) * 100;

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.topArea, { paddingTop: insets.top + 60 }]}>
        <Animated.View style={[styles.simBadge, fadeSlide(titleAnim)]}>
          <Text style={styles.simBadgeText}>PREVIEW</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
          how's your energy{'\n'}today?
        </Animated.Text>

        <Animated.View style={[styles.emojiContainer, { opacity: emojiAnim, transform: [{ scale: emojiScale }] }]}>
          <Text style={styles.emoji}>{currentMood.emoji}</Text>
        </Animated.View>

        <Animated.View style={[styles.sliderContainer, fadeSlide(sliderAnim)]}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${sliderPosition}%` }]} />
            <View style={[styles.sliderThumb, { left: `${sliderPosition}%` }]} />
          </View>
          <Animated.Text style={[styles.moodLabel, { opacity: labelAnim, color: currentMood.color }]}>
            {currentMood.label}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
        <PrimaryButton title="continue" onPress={handleContinue} variant="white" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topArea: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  simBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  simBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    lineHeight: 42,
    marginBottom: 48,
  },
  emojiContainer: {
    marginBottom: 48,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center' as const,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center' as const,
  },
  sliderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    position: 'relative' as const,
    marginBottom: 16,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute' as const,
    top: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  moodLabel: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    textAlign: 'center' as const,
  },
  footer: {
    paddingHorizontal: 28,
  },
});
