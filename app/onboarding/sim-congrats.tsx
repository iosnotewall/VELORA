import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Check, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import PrimaryButton from '@/components/PrimaryButton';

export default function SimCongratsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, goal } = useAppState();

  const checkAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.3)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const noteAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const productName = products?.[0] || 'Daily Stack';

  const goalLabels: Record<string, string> = {
    energy: 'energy & vitality',
    sleep: 'sleep & recovery',
    stress: 'stress management',
    focus: 'focus & clarity',
    hormones: 'hormonal balance',
    metabolism: 'metabolic health',
    sport: 'performance & recovery',
    immune: 'immune support',
  };
  const goalLabel = goalLabels[goal] || 'your wellness';

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: useNative, damping: 10, stiffness: 150 }),
      ]),
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.timing(subAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 120 }),
      Animated.delay(400),
      Animated.timing(noteAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/sim-streak' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animated.View style={[styles.checkCircle, { opacity: checkAnim, transform: [{ scale: checkScale }] }]}>
            <Check size={32} color={Colors.blue} strokeWidth={3} />
          </Animated.View>

          <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
            congratulations!
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, fadeSlide(subAnim)]}>
            you've completed your first check-in
          </Animated.Text>
        </View>

        <View style={styles.middleSection}>
          <Animated.View style={[styles.logCard, fadeSlide(cardAnim)]}>
            <View style={styles.logCardHeader}>
              <View style={styles.logDot} />
              <Text style={styles.logTitle}>First Check-in</Text>
              <Text style={styles.logDate}>{dateStr}</Text>
            </View>
            <Text style={styles.logBody} numberOfLines={2}>
              Tracked {goalLabel} — feeling good. Your supplements are building up in your system.
            </Text>
            <View style={styles.logFooter}>
              <Text style={styles.logProduct}>{productName}</Text>
              <ArrowRight size={16} color={Colors.blue} strokeWidth={2} />
            </View>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.noteText, fadeSlide(noteAnim)]}>
          every check-in is saved to your journal{'\n'}to track how your body responds over time.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
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
  },
  topSection: {
    alignItems: 'center' as const,
    paddingTop: 32,
    marginBottom: 48,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0E8F5',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 34,
    color: Colors.blue,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  logCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  logCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.blue,
    marginRight: 10,
  },
  logTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.navy,
    flex: 1,
  },
  logDate: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
  },
  logBody: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
    marginBottom: 14,
  },
  logFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  logProduct: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.blue,
  },
  noteText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    paddingTop: 8,
  },
});
