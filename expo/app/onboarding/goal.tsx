import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Easing, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Moon, Brain, Leaf, Flame, Heart, Shield, Check, Sun, Star, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Moon, Brain, Leaf, Flame, Heart, Shield, Sun, Star, Sparkles,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;
const ROW_COUNT = Math.ceil(GOALS.length / 2);

export default function GoalScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');

  const rowOpacity = useRef(Array.from({ length: ROW_COUNT }, () => new Animated.Value(0))).current;
  const rowSlide = useRef(Array.from({ length: ROW_COUNT }, () => new Animated.Value(30))).current;

  useEffect(() => {
    const animations = Array.from({ length: ROW_COUNT }, (_, rowIndex) =>
      Animated.parallel([
        Animated.timing(rowOpacity[rowIndex], {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rowSlide[rowIndex], {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    Animated.stagger(120, animations).start();
  }, []);

  const handleSelect = useCallback((goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(goalId);
  }, []);

  const handleContinue = useCallback(() => {
    updateState({ goal: selected });
    router.push('/onboarding/products' as any);
  }, [selected, updateState, router]);

  const rows: (typeof GOALS[number])[][] = [];
  for (let i = 0; i < GOALS.length; i += 2) {
    rows.push(GOALS.slice(i, i + 2) as any);
  }

  return (
    <OnboardingScreen step={2} totalSteps={9} ctaText="This is my goal" ctaEnabled={!!selected} onCta={handleContinue}>
      <Text style={styles.headline}>But first, what's your{'\n'}main health goal?</Text>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {rows.map((row, rowIndex) => (
          <Animated.View
            key={rowIndex}
            style={[
              styles.row,
              {
                opacity: rowOpacity[rowIndex],
                transform: [{ translateY: rowSlide[rowIndex] }],
              },
            ]}
          >
            {row.map((goal) => {
              const IconComponent = ICON_MAP[goal.icon];
              const isSelected = selected === goal.id;
              const categoryColor = Colors.category[goal.id] || Colors.navy;

              return (
                <View key={goal.id} style={{ width: CARD_WIDTH }}>
                  <TouchableOpacity
                    onPress={() => handleSelect(goal.id)}
                    activeOpacity={0.8}
                    testID={`goal-${goal.id}`}
                  >
                    <View
                      style={[
                        styles.card,
                        isSelected && {
                          backgroundColor: categoryColor + '12',
                          borderColor: categoryColor,
                          shadowColor: categoryColor,
                          shadowOpacity: 0.18,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <View style={styles.cardTop}>
                        <View style={[styles.iconCircle, { backgroundColor: categoryColor + '18' }]}>
                          {IconComponent && <IconComponent size={24} color={categoryColor} strokeWidth={2.2} />}
                        </View>
                        {isSelected && (
                          <View style={[styles.checkBadge, { backgroundColor: categoryColor }]}>
                            <Check size={12} color={Colors.white} strokeWidth={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.cardLabel, isSelected && { color: categoryColor }]} numberOfLines={2}>
                        {goal.label}
                      </Text>
                      <Text style={styles.cardSub} numberOfLines={2}>{goal.sub}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Animated.View>
        ))}
      </ScrollView>
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
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row' as const,
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
    minHeight: 148,
    justifyContent: 'flex-start' as const,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cardLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  cardSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 17,
  },
});
