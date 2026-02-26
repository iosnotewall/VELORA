import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';
import { useAppState } from '@/hooks/useAppState';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

interface MetricConfig {
  question: string;
  lowLabel: string;
  highLabel: string;
  color: string;
  emoji: string[];
}

const GOAL_CHECKIN_CONFIG: Record<string, MetricConfig> = {
  energy: {
    question: "how's your energy\nright now?",
    lowLabel: 'drained',
    highLabel: 'energized',
    color: '#C4943E',
    emoji: ['😔', '😐', '🙂', '😊', '⚡'],
  },
  sleep: {
    question: "how did you sleep\nlast night?",
    lowLabel: 'terrible',
    highLabel: 'amazing',
    color: '#6B7DB4',
    emoji: ['😩', '😴', '🙂', '😌', '✨'],
  },
  focus: {
    question: "how clear is your\nthinking today?",
    lowLabel: 'foggy',
    highLabel: 'crystal clear',
    color: '#7B5BA8',
    emoji: ['🌫️', '😶', '🙂', '🧠', '🎯'],
  },
  stress: {
    question: "how calm are you\nfeeling right now?",
    lowLabel: 'overwhelmed',
    highLabel: 'at peace',
    color: '#6B7DB4',
    emoji: ['😰', '😟', '😐', '😌', '🍃'],
  },
  metabolism: {
    question: "how's your body\nfeeling today?",
    lowLabel: 'sluggish',
    highLabel: 'balanced',
    color: '#C4943E',
    emoji: ['😫', '😐', '🙂', '💪', '🔥'],
  },
  hormones: {
    question: "how stable is your\nmood today?",
    lowLabel: 'all over the place',
    highLabel: 'very stable',
    color: '#B4756A',
    emoji: ['🎭', '😔', '😐', '😊', '💖'],
  },
  sport: {
    question: "how recovered do\nyou feel?",
    lowLabel: 'sore',
    highLabel: 'fully recovered',
    color: '#4A7A5F',
    emoji: ['🥴', '😤', '🙂', '💪', '🏆'],
  },
  immune: {
    question: "how strong are you\nfeeling today?",
    lowLabel: 'under the weather',
    highLabel: 'strong',
    color: '#3A80C9',
    emoji: ['🤒', '😕', '🙂', '😊', '🛡️'],
  },
};

const DEFAULT_CONFIG: MetricConfig = {
  question: "how are you\nfeeling today?",
  lowLabel: 'not great',
  highLabel: 'amazing',
  color: '#3A80C9',
  emoji: ['😔', '😐', '🙂', '😊', '✨'],
};

export default function SimCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();

  const config = GOAL_CHECKIN_CONFIG[goal] || DEFAULT_CONFIG;

  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const greetAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const scoresAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  const scoreButtonAnims = useRef(SCORE_OPTIONS.map(() => new Animated.Value(0))).current;
  const scoreScaleAnims = useRef(SCORE_OPTIONS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(greetAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(emojiAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(scoresAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(100),
      ...SCORE_OPTIONS.map((_, i) =>
        Animated.spring(scoreButtonAnims[i], { toValue: 1, useNativeDriver: useNative, damping: 14, stiffness: 180, delay: i * 60 })
      ),
    ]).start();
  }, []);

  const handleSelectScore = useCallback((score: number) => {
    const wasNull = selectedScore === null;
    setSelectedScore(score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const idx = score - 1;
    const useNative = Platform.OS !== 'web';

    Animated.parallel([
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.2, duration: 120, useNativeDriver: useNative }),
        Animated.spring(emojiScale, { toValue: 1, useNativeDriver: useNative, damping: 12, stiffness: 200 }),
      ]),
      Animated.timing(labelAnim, { toValue: 1, duration: 250, useNativeDriver: useNative }),
      Animated.sequence([
        Animated.timing(scoreScaleAnims[idx], { toValue: 1.15, duration: 100, useNativeDriver: useNative }),
        Animated.spring(scoreScaleAnims[idx], { toValue: 1, useNativeDriver: useNative, damping: 12, stiffness: 200 }),
      ]),
    ]).start();

    if (wasNull) {
      Animated.spring(btnAnim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 140 }).start();
    }
  }, [selectedScore, emojiScale, labelAnim, scoreScaleAnims, btnAnim]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-congrats' as any);
  }, [router]);

  const currentEmoji = selectedScore !== null ? config.emoji[selectedScore - 1] : '🫶';
  const currentLabel = selectedScore !== null
    ? selectedScore <= 2 ? config.lowLabel : selectedScore >= 4 ? config.highLabel : 'okay'
    : 'tap to rate';

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const displayName = userName ? userName.split(' ')[0].toLowerCase() : '';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.topArea, { paddingTop: insets.top + 50 }]}>
        <Animated.View style={[styles.badge, fadeSlide(greetAnim)]}>
          <Text style={styles.badgeText}>DAILY CHECK-IN</Text>
        </Animated.View>

        {displayName ? (
          <Animated.Text style={[styles.greeting, fadeSlide(greetAnim)]}>
            hey {displayName} 👋
          </Animated.Text>
        ) : null}

        <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
          {config.question}
        </Animated.Text>

        <Animated.View style={[styles.emojiContainer, { opacity: emojiAnim, transform: [{ scale: emojiScale }] }]}>
          <Text style={styles.emoji}>{currentEmoji}</Text>
        </Animated.View>

        <Animated.Text style={[styles.moodLabel, { opacity: labelAnim, color: selectedScore !== null ? config.color : Colors.mediumGray }]}>
          {currentLabel}
        </Animated.Text>

        <Animated.View style={[styles.scoresRow, fadeSlide(scoresAnim)]}>
          {SCORE_OPTIONS.map((score, i) => {
            const isSelected = selectedScore === score;
            return (
              <Animated.View
                key={score}
                style={{
                  opacity: scoreButtonAnims[i],
                  transform: [
                    { scale: scoreScaleAnims[i] },
                    { translateY: scoreButtonAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelectScore(score)}
                  activeOpacity={0.7}
                  style={[
                    styles.scoreButton,
                    isSelected && { backgroundColor: config.color, borderColor: config.color },
                  ]}
                >
                  <Text style={[
                    styles.scoreText,
                    isSelected && styles.scoreTextActive,
                  ]}>
                    {score}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.scaleLabels, fadeSlide(scoresAnim)]}>
          <Text style={styles.scaleLabelText}>{config.lowLabel}</Text>
          <Text style={styles.scaleLabelText}>{config.highLabel}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
        <PrimaryButton title="log check-in" onPress={handleContinue} disabled={selectedScore === null} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  topArea: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  badge: {
    backgroundColor: 'rgba(26,31,60,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(26,31,60,0.04)',
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(26,31,60,0.35)',
    letterSpacing: 1.5,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 18,
    color: Colors.mediumGray,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    textAlign: 'center' as const,
    lineHeight: 40,
    marginBottom: 36,
    letterSpacing: -0.3,
  },
  emojiContainer: {
    marginBottom: 12,
  },
  emoji: {
    fontSize: 72,
    textAlign: 'center' as const,
  },
  moodLabel: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    textAlign: 'center' as const,
    marginBottom: 40,
    letterSpacing: -0.2,
  },
  scoresRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 12,
  },
  scoreButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(26,31,60,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(26,31,60,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scoreText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'rgba(26,31,60,0.3)',
  },
  scoreTextActive: {
    color: '#FFFFFF',
  },
  scaleLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    width: 52 * 5 + 12 * 4,
    paddingHorizontal: 4,
  },
  scaleLabelText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(26,31,60,0.25)',
  },
  footer: {
    paddingHorizontal: 28,
  },
});
