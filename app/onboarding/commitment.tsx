import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CircleDot, ThumbsUp, Target, Flame, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { COMMITMENT_OPTIONS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const COMMIT_ICON_MAP: Record<string, React.ComponentType<any>> = {
  CircleDot,
  ThumbsUp,
  Target,
  Flame,
};

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);

  const eyebrowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(COMMITMENT_OPTIONS.map(() => new Animated.Value(0))).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(eyebrowAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.stagger(80, optionAnims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 20, stiffness: 140 })
      )),
    ]).start();
  }, []);

  useEffect(() => {
    if (selected) {
      Animated.spring(btnAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 140 }).start();
    }
  }, [selected]);

  const handleSelect = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    const option = COMMITMENT_OPTIONS.find(o => o.id === selected);
    updateState({ commitmentLevel: selected });
    router.push('/onboarding/love-it' as any);
  }, [selected, updateState, router]);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <Animated.Text style={[styles.eyebrow, fadeSlide(eyebrowAnim)]}>so,</Animated.Text>
        <Animated.Text style={[styles.headline, fadeSlide(titleAnim)]}>
          how committed are you to making this future happen?
        </Animated.Text>

        <View style={styles.options}>
          {[...COMMITMENT_OPTIONS].reverse().map((option, index) => {
            const isSelected = selected === option.id;
            return (
              <Animated.View key={option.id} style={fadeSlide(optionAnims[index])}>
                <TouchableOpacity
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  testID={`commitment-${option.id}`}
                >
                  <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                    {COMMIT_ICON_MAP[option.icon] && React.createElement(COMMIT_ICON_MAP[option.icon], { size: 20, color: isSelected ? Colors.blue : Colors.mediumGray, strokeWidth: 2 })}
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color={Colors.white} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginBottom: 36,
  },
  options: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: Colors.blue,
    backgroundColor: '#F0F4FA',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EEED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 14,
  },
  iconWrapSelected: {
    backgroundColor: '#E0E8F5',
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.darkGray,
    flex: 1,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.blue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  footer: {
    paddingTop: 12,
  },
});
