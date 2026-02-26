import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOAL_METRICS, GOALS } from '@/constants/content';
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
    color: '#D4A853',
    emoji: ['😔', '😐', '🙂', '😊', '⚡'],
  },
  sleep: {
    question: "how did you sleep\nlast night?",
    lowLabel: 'terrible',
    highLabel: 'amazing',
    color: '#7B8FC4',
    emoji: ['😩', '😴', '🙂', '😌', '✨'],
  },
  focus: {
    question: "how clear is your\nthinking today?",
    lowLabel: 'foggy',
    highLabel: 'crystal clear',
    color: '#8B6BB8',
    emoji: ['🌫️', '😶', '🙂', '🧠', '🎯'],
  },
  stress: {
    question: "how calm are you\nfeeling right now?",
    lowLabel: 'overwhelmed',
    highLabel: 'at peace',
    color: '#7B8FC4',
    emoji: ['😰', '😟', '😐', '😌', '🍃'],
  },
  metabolism: {
    question: "how's your body\nfeeling today?",
    lowLabel: 'sluggish',
    highLabel: 'balanced',
    color: '#D4A853',
    emoji: ['😫', '😐', '🙂', '💪', '🔥'],
  },
  hormones: {
    question: "how stable is your\nmood today?",
    lowLabel: 'all over the place',
    highLabel: 'very stable',
    color: '#C4857A',
    emoji: ['🎭', '😔', '😐', '😊', '💖'],
  },
  sport: {
    question: "how recovered do\nyou feel?",
    lowLabel: 'sore',
    highLabel: 'fully recovered',
    color: '#5A8A6F',
    emoji: ['🥴', '😤', '🙂', '💪', '🏆'],
  },
  immune: {
    question: "how strong are you\nfeeling today?",
    lowLabel: 'under the weather',
    highLabel: 'strong',
    color: '#4A90D9',
    emoji: ['🤒', '😕', '🙂', '😊', '🛡️'],
  },
};

const DEFAULT_CONFIG: MetricConfig = {
  question: "how are you\nfeeling today?",
  lowLabel: 'not great',
  highLabel: 'amazing',
  color: '#4A90D9',
  emoji: ['😔', '😐', '🙂', '😊', '✨'],
};

const BG_COLORS: Record<string, string[]> = {
  energy: ['#2A1F0A', '#1F2210', '#1A2010', '#1E2A0C', '#2A2500'],
  sleep: ['#1A1428', '#151838', '#0E1A38', '#0A1E3A', '#0B1A40'],
  focus: ['#1E1428', '#1A1838', '#141A38', '#0E2040', '#0A1842'],
  stress: ['#0A2018', '#0E2420', '#102820', '#143022', '#103420'],
  metabolism: ['#2A1F0A', '#241C08', '#1F2010', '#1E2A0C', '#2A2200'],
  hormones: ['#2A1418', '#281520', '#221828', '#1E1A30', '#1A1835'],
  sport: ['#0A2014', '#0E2818', '#102A18', '#14301A', '#103418'],
  immune: ['#0A1428', '#0E1830', '#101C38', '#0A2040', '#081E48'],
};

export default function SimCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();

  const config = GOAL_CHECKIN_CONFIG[goal] || DEFAULT_CONFIG;
  const bgColors = BG_COLORS[goal] || ['#1A1428', '#1A2438', '#0B1A2E', '#142E20', '#0A1842'];

  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [autoPlaying, setAutoPlaying] = useState(true);

  const greetAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const scoresAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(1)).current;
  const bgColorAnim = useRef(new Animated.Value(2)).current;

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
    ]).start(() => {
      setTimeout(() => {
        animateToScore(3);
        setTimeout(() => {
          animateToScore(4);
          setTimeout(() => {
            setAutoPlaying(false);
            Animated.spring(btnAnim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 140 }).start();
          }, 700);
        }, 700);
      }, 500);
    });
  }, []);

  const animateToScore = useCallback((score: number) => {
    setSelectedScore(score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const idx = score - 1;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.2, duration: 120, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(emojiScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 12, stiffness: 200 }),
      ]),
      Animated.sequence([
        Animated.timing(labelAnim, { toValue: 0, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(bgColorAnim, { toValue: idx, duration: 500, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(scoreScaleAnims[idx], { toValue: 1.15, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(scoreScaleAnims[idx], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 12, stiffness: 200 }),
      ]),
    ]).start();
  }, [emojiScale, labelAnim, bgColorAnim, scoreScaleAnims]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-congrats' as any);
  }, [router]);

  const currentEmoji = selectedScore !== null ? config.emoji[selectedScore - 1] : config.emoji[2];
  const currentLabel = selectedScore !== null
    ? selectedScore <= 2 ? config.lowLabel : selectedScore >= 4 ? config.highLabel : 'okay'
    : 'okay';

  const bgColor = bgColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: bgColors,
  });

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const displayName = userName ? userName.split(' ')[0].toLowerCase() : '';

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.topArea, { paddingTop: insets.top + 50 }]}>
        <Animated.View style={[styles.simBadge, fadeSlide(greetAnim)]}>
          <Text style={styles.simBadgeText}>DAILY CHECK-IN</Text>
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

        <Animated.Text style={[styles.moodLabel, { opacity: labelAnim, color: config.color }]}>
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
                  onPress={() => !autoPlaying && animateToScore(score)}
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
        <PrimaryButton title="log check-in" onPress={handleContinue} variant="white" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topArea: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  simBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  simBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scoreText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'rgba(255,255,255,0.4)',
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
    color: 'rgba(255,255,255,0.3)',
  },
  footer: {
    paddingHorizontal: 28,
  },
});
