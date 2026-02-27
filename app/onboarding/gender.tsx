import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import { Mars, Venus, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

interface GenderOption {
  id: string;
  label: string;
  sub: string;
  icon: React.ElementType;
}

const OPTIONS: GenderOption[] = [
  { id: 'male',   label: 'Male',              sub: 'Tune recommendations to male physiology',  icon: Mars },
  { id: 'female', label: 'Female',            sub: 'Tune recommendations to female physiology', icon: Venus },
  { id: 'skip',   label: 'Prefer not to say', sub: "No worries — we'll keep advice universal",  icon: HelpCircle },
];

const STAGGER = 140;

export default function GenderScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');

  const titleAnim   = useRef(new Animated.Value(0)).current;
  const subLineAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims  = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const SUB_LINES = [
    'Your body processes supplements',
    'differently based on biology.',
    'This helps us dial in the right doses and timing.',
  ];

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    const sequence = [
      Animated.delay(400),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 1100,
        easing,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.delay(500),
      Animated.stagger(
        350,
        subLineAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 650,
            easing,
            useNativeDriver: Platform.OS !== 'web',
          })
        )
      ),
      Animated.delay(300),
      Animated.stagger(
        STAGGER,
        optionAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 420,
            easing,
            useNativeDriver: Platform.OS !== 'web',
          })
        )
      ),
    ];
    Animated.sequence(sequence).start();
  }, []);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 0.96,
        useNativeDriver: Platform.OS !== 'web',
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        damping: 15,
        stiffness: 200,
      }),
    ]).start();
  }, [scaleAnims]);

  const handleContinue = useCallback(() => {
    updateState({ gender: selected === 'skip' ? '' : selected });
    router.push('/onboarding/consider' as any);
  }, [selected, updateState, router]);

  const titleTranslate = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <OnboardingScreen
      step={3}
      totalSteps={9}
      ctaText="Continue"
      ctaEnabled={!!selected}
      onCta={handleContinue}
      hideHeader
    >
      <View style={styles.topSpacer} />

      <Animated.Text
        style={[
          styles.headline,
          {
            opacity: titleAnim,
            transform: [{ translateY: titleTranslate }],
          },
        ]}
      >
        Let's personalize{"\n"}your plan
      </Animated.Text>

      <View style={styles.subtitleBlock}>
        {SUB_LINES.map((line, i) => {
          const lineTranslate = subLineAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          });
          return (
            <Animated.Text
              key={i}
              style={[
                styles.subtitleLine,
                {
                  opacity: subLineAnims[i],
                  transform: [{ translateY: lineTranslate }],
                },
              ]}
            >
              {line}
            </Animated.Text>
          );
        })}
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;
          const IconComponent = option.icon;
          const optTranslate = optionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [14, 0],
          });

          return (
            <Animated.View
              key={option.id}
              style={{
                opacity: optionAnims[index],
                transform: [
                  { translateY: optTranslate },
                  { scale: scaleAnims[index] },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
                testID={`gender-${option.id}`}
              >
                <View style={styles.optionRow}>
                  <IconComponent
                    size={22}
                    color={isSelected ? Colors.navy : Colors.mediumGray}
                    strokeWidth={1.6}
                  />
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  topSpacer: {
    height: 72,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitleBlock: {
    marginBottom: 32,
  },
  subtitleLine: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    lineHeight: 23,
  },
  options: {
    gap: 12,
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
});
