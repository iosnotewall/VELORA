import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { User, UserRound, EyeOff } from 'lucide-react-native';
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
  { id: 'male',   label: 'Male',              sub: 'Tune recommendations to male physiology',  icon: User },
  { id: 'female', label: 'Female',            sub: 'Tune recommendations to female physiology', icon: UserRound },
  { id: 'skip',   label: 'Prefer not to say', sub: "No worries — we'll keep advice universal",  icon: EyeOff },
];

const STAGGER = 80;

export default function GenderScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');

  const titleAnim   = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims  = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const sequence = [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.stagger(
        STAGGER,
        optionAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 280,
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

  const titleTranslate    = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const subtitleTranslate = subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <OnboardingScreen
      step={3}
      totalSteps={9}
      ctaText="Continue"
      ctaEnabled={!!selected}
      onCta={handleContinue}
    >
      <Animated.Text
        style={[
          styles.headline,
          {
            opacity: titleAnim,
            transform: [{ translateY: titleTranslate }],
          },
        ]}
      >
        Your biology is{'\n'}your edge.
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleAnim,
            transform: [{ translateY: subtitleTranslate }],
          },
        ]}
      >
        The same supplement hits differently depending on your biology. We calibrate every recommendation to match.
      </Animated.Text>

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
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionSub}>{option.sub}</Text>
                  </View>
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
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    lineHeight: 23,
    marginBottom: 32,
  },
  options: {
    gap: 12,
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
  optionSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 18,
  },
});
