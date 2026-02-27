import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GenderOption {
  id: string;
  label: string;
  emoji: string;
}

const OPTIONS: GenderOption[] = [
  { id: 'male', label: 'Male', emoji: '♂' },
  { id: 'female', label: 'Female', emoji: '♀' },
  { id: 'other', label: 'Other', emoji: '⚧' },
  { id: 'skip', label: 'Prefer not to say', emoji: '—' },
];

export default function GenderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;
  const selectionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    Animated.stagger(
      100,
      optionAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          damping: 14,
          stiffness: 120,
          useNativeDriver: Platform.OS !== 'web',
        })
      )
    ).start();
  }, []);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const prevIndex = OPTIONS.findIndex(o => o.id === selected);
    if (prevIndex >= 0 && prevIndex !== index) {
      Animated.timing(selectionAnims[prevIndex], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    setSelected(id);

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
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [selected, scaleAnims, selectionAnims]);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ gender: selected === 'skip' ? '' : selected });
    router.push('/onboarding/consider' as any);
  }, [selected, updateState, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          testID="back-button"
        >
          <ChevronLeft size={24} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.headline,
            {
              opacity: titleAnim,
              transform: [{
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              }],
            },
          ]}
        >
          How should we{'\n'}personalize for you?
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleAnim,
              transform: [{
                translateY: subtitleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              }],
            },
          ]}
        >
          This helps us tailor supplement advice to your biology.
        </Animated.Text>

        <View style={styles.optionsGrid}>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            const isLast = option.id === 'skip';

            const bgColor = selectionAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.white, '#EEF2FF'],
            });

            const borderColor = selectionAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.border, Colors.blue],
            });

            return (
              <Animated.View
                key={option.id}
                style={[
                  isLast ? styles.optionWrapperFull : styles.optionWrapper,
                  {
                    opacity: optionAnims[index],
                    transform: [
                      {
                        translateY: optionAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                      { scale: scaleAnims[index] },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleSelect(option.id, index)}
                  activeOpacity={0.8}
                  testID={`gender-${option.id}`}
                  style={{ flex: 1 }}
                >
                  <Animated.View
                    style={[
                      isLast ? styles.optionCardCompact : styles.optionCard,
                      {
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    {!isLast && (
                      <View style={[
                        styles.emojiCircle,
                        isSelected && styles.emojiCircleSelected,
                      ]}>
                        <Text style={styles.emoji}>{option.emoji}</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        isLast ? styles.optionLabelCompact : styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </View>
  );
}

const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    lineHeight: 22,
    marginBottom: 36,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: CARD_GAP,
  },
  optionWrapper: {
    width: CARD_WIDTH,
  },
  optionWrapperFull: {
    width: '100%' as const,
  },
  optionCard: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 14,
    minHeight: 130,
  },
  optionCardCompact: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F2F8',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emojiCircleSelected: {
    backgroundColor: '#DDE4FF',
  },
  emoji: {
    fontSize: 26,
    color: Colors.navy,
  },
  optionLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 17,
    color: Colors.navy,
    textAlign: 'center' as const,
  },
  optionLabelCompact: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
  },
  optionLabelSelected: {
    color: Colors.deepBlue,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
