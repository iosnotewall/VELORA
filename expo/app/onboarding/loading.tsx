import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';

export default function LoadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, products } = useAppState();
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  const goalData = GOALS.find(g => g.id === goal);
  const productCount = products?.length || 1;

  const STAGES = [
    { threshold: 0, text: `Mapping your ${goalData?.label?.toLowerCase() || 'health'} profile...` },
    { threshold: 28, text: `Matching ${productCount} supplement${productCount > 1 ? 's' : ''} to your timeline...` },
    { threshold: 58, text: 'Building your 30-day consistency plan...' },
    { threshold: 85, text: 'Finalizing your personalized protocol...' },
  ];

  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 4500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        router.push('/onboarding/plan-ready' as any);
      }, 400);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(dotAnim, { toValue: 0.3, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();

    return () => progressAnim.removeListener(listener);
  }, []);

  const currentStage = [...STAGES].reverse().find(s => progress >= s.threshold) || STAGES[0];

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.pulsingDot, { opacity: dotAnim }]} />

        <Text style={styles.percent}>{progress}%</Text>
        <Text style={styles.label}>{currentStage.text}</Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Text style={styles.footerText}>This won't take long...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue,
    marginBottom: 32,
  },
  percent: {
    fontFamily: Fonts.heading,
    fontSize: 64,
    color: Colors.white,
    letterSpacing: -2,
    marginBottom: 12,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 40,
    minHeight: 48,
  },
  barTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.blue,
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 40,
    alignItems: 'center' as const,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
  },
});
