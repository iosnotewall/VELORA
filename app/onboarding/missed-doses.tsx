import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const OPTIONS = [
  { label: '1–2 times', value: 2, sub: 'occasionally' },
  { label: '3–4 times', value: 4, sub: 'pretty often' },
  { label: '5–6 times', value: 6, sub: 'most days' },
  { label: 'every day', value: 7, sub: 'all the time' },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<number | null>(null);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;
  const selectionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.stagger(100, optionAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: Platform.OS !== 'web',
        })
      )),
    ]).start();
  }, []);

  const handleSelect = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selected !== null && selected !== index) {
      Animated.timing(selectionAnims[selected], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    setSelected(index);

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 60,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    Animated.timing(selectionAnims[index], {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [selected, scaleAnims, selectionAnims]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ missedDoses: OPTIONS[selected].value });
    router.push('/onboarding/impact' as any);
  }, [selected, updateState, router]);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.content}>
        <Animated.View style={fadeSlide(titleAnim)}>
          <Text style={styles.preTitle}>be honest</Text>
          <Text style={styles.headline}>
            How often do you{'\n'}
            <Text style={styles.headlineAccent}>miss</Text> your supplements?
          </Text>
        </Animated.View>

        <View style={styles.optionsWrap}>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === index;

            const bgColor = selectionAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['#FFFFFF', '#EBF2FF'],
            });

            const borderColor = selectionAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.border, Colors.blue],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  fadeSlide(optionAnims[index]),
                  { transform: [{ scale: scaleAnims[index] }, ...(fadeSlide(optionAnims[index]).transform || [])] },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleSelect(index)}
                  activeOpacity={0.8}
                  testID={`missed-doses-${index}`}
                >
                  <Animated.View
                    style={[
                      styles.optionCard,
                      { backgroundColor: bgColor, borderColor: borderColor },
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.optionSub, isSelected && styles.optionSubActive]}>
                        {option.sub}
                      </Text>
                    </View>
                    <Animated.View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: borderColor,
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Continue" onPress={handleContinue} disabled={selected === null} />
      </View>
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
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
  },
  preTitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 40,
    marginBottom: 36,
    letterSpacing: -0.3,
  },
  headlineAccent: {
    color: Colors.warning,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 18,
    color: Colors.navy,
    marginBottom: 2,
  },
  optionLabelActive: {
    color: Colors.deepBlue,
  },
  optionSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  optionSubActive: {
    color: Colors.blue,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
