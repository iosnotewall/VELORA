import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';

const SLIDER_STEPS = [
  { label: 'Rarely', emoji: '😞' },
  { label: 'Sometimes', emoji: '😕' },
  { label: 'Not sure', emoji: '😐' },
  { label: 'Often', emoji: '😊' },
  { label: 'Almost always', emoji: '🤩' },
];

const THUMB_SIZE = 32;
const TRACK_HEIGHT = 6;
const TRACK_HORIZONTAL_PADDING = 28;

export default function RealityScreen() {
  const router = useRouter();
  const { goal, updateState } = useAppState();
  const [hasInteracted, setHasInteracted] = useState<boolean>(true);
  const [stepIndex, setStepIndex] = useState<number>(2);
  const [trackWidth, setTrackWidth] = useState<number>(Dimensions.get('window').width - 40 - TRACK_HORIZONTAL_PADDING * 2);

  const pan = useRef(new Animated.Value(0.5)).current;
  const emojiScaleAnim = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const lastSnappedStep = useRef<number>(2);

  const goalData = GOALS.find(g => g.id === goal);
  const feeling = goalData?.feeling || 'healthy';

  const getStepFromRatio = useCallback((ratio: number): number => {
    return Math.round(Math.max(0, Math.min(1, ratio)) * 4);
  }, []);

  const getRatioFromStep = useCallback((step: number): number => {
    return step / 4;
  }, []);

  const bounceEmoji = useCallback(() => {
    Animated.sequence([
      Animated.timing(emojiScaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(emojiScaleAnim, { toValue: 1, damping: 8, stiffness: 300, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [emojiScaleAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!hasInteracted) setHasInteracted(true);
        const locationX = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
        pan.setValue(ratio);
        const newStep = Math.round(ratio * 4);
        if (newStep !== lastSnappedStep.current) {
          lastSnappedStep.current = newStep;
          setStepIndex(newStep);
          bounceEmoji();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentX = gestureState.moveX - TRACK_HORIZONTAL_PADDING - 20;
        const ratio = Math.max(0, Math.min(1, currentX / trackWidth));
        pan.setValue(ratio);
        const newStep = Math.round(ratio * 4);
        if (newStep !== lastSnappedStep.current) {
          lastSnappedStep.current = newStep;
          setStepIndex(newStep);
          bounceEmoji();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderRelease: () => {
        const snapRatio = getRatioFromStep(lastSnappedStep.current);
        Animated.spring(pan, { toValue: snapRatio, damping: 20, stiffness: 300, useNativeDriver: false }).start();
      },
    })
  ).current;



  const currentStep = SLIDER_STEPS[stepIndex];
  const score = stepIndex + 1;

  const thumbTranslateX = pan.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth - THUMB_SIZE],
  });

  const filledWidth = pan.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTrackWidth(w);
  }, []);

  return (
    <OnboardingScreen
      step={5}
      totalSteps={7}
      ctaText="That's where I am"
      ctaEnabled={hasInteracted}
      onCta={() => {
        updateState({ gapScore: score });
        router.push('/onboarding/mirror' as any);
      }}
    >
      <Text style={styles.headline}>How often do you actually feel {feeling}?</Text>

      <View style={styles.emojiContainer}>
        <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: emojiScaleAnim }] }]}>
          {currentStep?.emoji}
        </Animated.Text>
      </View>

      <View style={styles.sliderArea}>
        <View style={styles.trackContainer} onLayout={onTrackLayout} {...panResponder.panHandlers}>
          <View style={styles.trackBackground} />
          <Animated.View style={[styles.trackFilled, { width: filledWidth }]} />
          <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbTranslateX }] }]} />
        </View>
      </View>

      <Animated.View style={[styles.labelContainer, { opacity: labelOpacity }]}>
        <Text style={styles.sliderLabel}>{currentStep?.label}</Text>
      </Animated.View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginTop: 8,
    marginBottom: 8,
  },
  emojiContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 36,
  },
  bigEmoji: {
    fontSize: 100,
    lineHeight: 120,
  },
  sliderArea: {
    paddingHorizontal: TRACK_HORIZONTAL_PADDING,
    marginTop: 8,
  },
  trackContainer: {
    height: 48,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  trackBackground: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    backgroundColor: Colors.divider,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFilled: {
    position: 'absolute' as const,
    left: 0,
    height: TRACK_HEIGHT,
    backgroundColor: Colors.navy,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute' as const,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    top: (48 - THUMB_SIZE) / 2,
  },
  labelContainer: {
    alignItems: 'center' as const,
    marginTop: 14,
  },
  sliderLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 20,
    color: Colors.navy,
    textAlign: 'center' as const,
  },
});
