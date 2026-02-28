import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThumbsUp, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

export default function LoveItScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const circleAnim = useRef(new Animated.Value(0)).current;
  const thumbAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(circleAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 14, stiffness: 100 }),
      Animated.spring(thumbAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 120 }),
      Animated.delay(200),
      Animated.timing(textAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(subAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/onboarding/reviews' as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.topSection}>
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.outerGlow, { opacity: circleAnim, transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.circle, { opacity: circleAnim, transform: [{ scale: circleAnim }] }]}>
            <Animated.View style={{ transform: [{ scale: thumbAnim }] }}>
              <ThumbsUp size={56} color={Colors.white} strokeWidth={1.6} />
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Animated.Text style={[styles.headline, { opacity: textAnim, transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          we love to see this.
        </Animated.Text>

        <Animated.Text style={[styles.subtext, { opacity: subAnim, transform: [{ translateY: subAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          a willing mindset is the foundation for real change. you've already set yourself up to see lasting results with your supplements.
        </Animated.Text>

        <Animated.View style={[styles.btnWrap, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <PrimaryButton title="Continue" onPress={handleContinue} variant="white" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue,
  },
  topSection: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  circleContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  outerGlow: {
    position: 'absolute' as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.white,
    lineHeight: 40,
    marginBottom: 14,
  },
  subtext: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
    marginBottom: 28,
  },
  btnWrap: {},
});
