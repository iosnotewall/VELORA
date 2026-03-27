import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Shield, Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { NOTIFICATION_EXAMPLES } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const useNative = Platform.OS !== 'web';

const BG_COLOR = '#FDFBF7';
const TEXT_PRIMARY = '#1A1F3C';
const TEXT_SECONDARY = '#6B6B7B';
const TEXT_TERTIARY = '#9A9AAA';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#EEEAE4';

export default function NotifyPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, updateState, userName } = useAppState();
  const goalColor = Colors.category[goal] || Colors.blue;
  const notifExample = NOTIFICATION_EXAMPLES[goal] || "Time to check in. Your body is listening.";
  const displayName = userName ? userName.split(' ')[0] : '';

  const [_showPopup, _setShowPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const featureAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.7)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const checkAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const continueAnim = useRef(new Animated.Value(0)).current;

  const bellWiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      ...featureAnims.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i === 0 ? 0 : 100),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        ])
      ),
      Animated.delay(300),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(bellWiggle, { toValue: 1, duration: 80, useNativeDriver: useNative }),
        Animated.timing(bellWiggle, { toValue: -1, duration: 80, useNativeDriver: useNative }),
        Animated.timing(bellWiggle, { toValue: 1, duration: 80, useNativeDriver: useNative }),
        Animated.timing(bellWiggle, { toValue: -1, duration: 80, useNativeDriver: useNative }),
        Animated.timing(bellWiggle, { toValue: 0, duration: 80, useNativeDriver: useNative }),
        Animated.delay(4000),
      ])
    ).start();
  }, []);

  const handleEnableReminders = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateState({ notificationsEnabled: true });
    setPermissionGranted(true);

    Animated.sequence([
      Animated.delay(100),
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: useNative, damping: 10, stiffness: 150 }),
      Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(continueAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  }, [updateState]);



  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/supplement-timing' as any);
  }, [router]);



  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const bellRotation = bellWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const features = [
    { icon: Bell, label: 'Daily gentle reminders', sub: 'Never miss your supplements' },
    { icon: Clock, label: 'Smart timing', sub: 'Personalized to your routine' },
    { icon: Shield, label: 'No spam, ever', sub: 'Just what matters to you' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.bellContainer, fadeSlide(titleAnim)]}>
          <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
            <View style={[styles.bellCircle, { backgroundColor: goalColor + '12', borderColor: goalColor + '25' }]}>
              <Bell size={36} color={goalColor} strokeWidth={1.8} />
            </View>
          </Animated.View>
          <View style={[styles.bellBadge, { backgroundColor: goalColor }]}>
            <Text style={styles.bellBadgeText}>1</Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
          {displayName ? `${displayName}, stay` : 'Stay'} on track{'\n'}with smart reminders
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, fadeSlide(subtitleAnim)]}>
          One nudge a day keeps the missed doses away.
        </Animated.Text>

        <View style={styles.featuresContainer}>
          {features.map((feature, i) => {
            const IconComp = feature.icon;
            return (
              <Animated.View key={i} style={[styles.featureRow, fadeSlide(featureAnims[i], 16)]}>
                <View style={[styles.featureIcon, { backgroundColor: goalColor + '10' }]}>
                  <IconComp size={18} color={goalColor} strokeWidth={2} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                  <Text style={styles.featureSub}>{feature.sub}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={[styles.previewCard, fadeSlide(subtitleAnim, 12)]}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewLogo, { backgroundColor: goalColor }]}>
              <Text style={styles.previewLogoText}>V</Text>
            </View>
            <Text style={styles.previewApp}>Volera</Text>
            <Text style={styles.previewTime}>now</Text>
          </View>
          <Text style={styles.previewBody}>{notifExample}</Text>
        </Animated.View>

        {permissionGranted && (
          <Animated.View style={[styles.successContainer, {
            opacity: checkAnim,
            transform: [{ scale: checkScale }],
          }]}>
            <View style={[styles.successCircle, { backgroundColor: Colors.success + '12', borderColor: Colors.success + '25' }]}>
              <Text style={styles.successEmoji}>✓</Text>
            </View>
            <Animated.Text style={[styles.successText, { opacity: checkAnim }]}>
              Reminders enabled!
            </Animated.Text>
          </Animated.View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {permissionGranted ? (
          <Animated.View style={{ opacity: continueAnim }}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: goalColor }]}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={fadeSlide(buttonAnim, 20)}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: goalColor }]}
              onPress={handleEnableReminders}
              activeOpacity={0.85}
            >
              <Bell size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.ctaText}>Enable reminders</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  bellContainer: {
    alignSelf: 'flex-start' as const,
    marginBottom: 28,
  },
  bellCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  bellBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: BG_COLOR,
  },
  bellBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: '#FFFFFF',
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: TEXT_PRIMARY,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 28,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  featureSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: TEXT_TERTIARY,
  },
  previewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    gap: 8,
  },
  previewLogo: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  previewLogoText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: '#FFFFFF',
  },
  previewApp: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 12,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  previewTime: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: TEXT_TERTIARY,
  },
  previewBody: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center' as const,
    marginTop: 28,
    gap: 12,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  successEmoji: {
    fontSize: 24,
    color: Colors.success,
  },
  successText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  ctaButton: {
    height: 58,
    borderRadius: 100,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  popupIconWrap: {
    marginBottom: 16,
  },
  popupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  popupTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center' as const,
    marginBottom: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  popupBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: '#666',
    textAlign: 'center' as const,
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  popupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.15)',
    width: '100%',
  },
  popupBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  popupBtnText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: '#007AFF',
  },
  popupBtnPrimary: {
    fontFamily: Fonts.headingSemiBold,
  },
});
