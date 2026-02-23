import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

export default function ShockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName } = useAppState();
  const [count, setCount] = useState(0);

  const nameAnim = useRef(new Animated.Value(0)).current;
  const counterValue = useRef(new Animated.Value(0)).current;
  const statAnim = useRef(new Animated.Value(0)).current;
  const turnAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = counterValue.addListener(({ value }) => {
      setCount(Math.round(value));
    });

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(nameAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(700),
      Animated.timing(counterValue, { toValue: 82, duration: 1800, useNativeDriver: false }),
      Animated.timing(statAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(900),
      Animated.timing(turnAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 2400);

    return () => counterValue.removeListener(listener);
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.content}>
        <View style={styles.counterWrap}>
          <Text style={styles.counter}>{count}%</Text>
        </View>

        <Animated.Text style={[styles.stat, fadeSlide(statAnim)]}>
          quit before their supplements{'\n'}have time to work.
        </Animated.Text>

        <Animated.View style={[styles.turnWrap, fadeSlide(turnAnim)]}>
          <View style={styles.goldLine} />
          <Text style={styles.turnText}>
            Let's make sure that's not you.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Let's go" onPress={() => router.push('/onboarding/goal' as any)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center' as const,
  },
  consider: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.mediumGray,
    marginBottom: 20,
  },
  counterWrap: {
    marginBottom: 12,
  },
  counter: {
    fontFamily: Fonts.heading,
    fontSize: 88,
    color: Colors.navy,
    letterSpacing: -3,
    lineHeight: 96,
  },
  stat: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.navy,
    lineHeight: 32,
    marginBottom: 36,
  },
  turnWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  goldLine: {
    width: 3,
    height: 28,
    backgroundColor: Colors.blue,
    borderRadius: 2,
  },
  turnText: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.darkGray,
    lineHeight: 24,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
