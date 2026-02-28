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

export default function NotifyPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, updateState, userName } = useAppState();
  const goalColor = Colors.category[goal] || Colors.blue;
  const notifExample = NOTIFICATION_EXAMPLES[goal] || "Time to check in. Your body is listening.";
  const displayName = userName ? userName.split(' ')[0] : '';

  const [showPopup, setShowPopup] = useState(false);
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

  const showPermissionPopup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPopup(true);

    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: useNative }),
      Animated.spring(popupScale, { toValue: 1, useNativeDriver: useNative, damping: 15, stiffness: 200 }),
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleAllow = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (Platform.OS !== 'web') {
      try {
        const { default: Notifications } = await import('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        updateState({ notificationsEnabled: status === 'granted' });
      } catch (e) {
        console.log('[NotifyPermission] Permission error:', e);
        updateState({ notificationsEnabled: true });
      }
    } else {
      updateState({ notificationsEnabled: true });
    }

    setPermissionGranted(true);

    Animated.parallel([
      Animated.timing(popupScale, { toValue: 0.9, duration: 200, useNativeDriver: useNative }),
      Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: useNative }),
    ]).start(() => {
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: useNative, damping: 10, stiffness: 150 }),
        Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        Animated.delay(300),
        Animated.timing(continueAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      ]).start();
    });
  }, [updateState]);

  const handleDontAllow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ notificationsEnabled: false });

    Animated.parallel([
      Animated.timing(popupScale, { toValue: 0.9, duration: 200, useNativeDriver: useNative }),
      Animated.timing(popupOpacity, { toValue: 0, duration: 200, useNativeDriver: useNative }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 300, useNativeDriver: useNative }),
    ]).start(() => {
      setShowPopup(false);
      router.push('/onboarding/supplement-timing' as any);
    });
  }, [updateState, router]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/supplement-timing' as any);
  }, [router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ notificationsEnabled: false });
    router.push('/onboarding/supplement-timing' as any);
  }, [updateState, router]);

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
      <View style={[styles.glowCircle, { backgroundColor: goalColor + '08' }]} />
      <View style={styles.glowTop} />

      <View style={styles.content}>
        <Animated.View style={[styles.bellContainer, fadeSlide(titleAnim)]}>
          <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
            <View style={[styles.bellCircle, { backgroundColor: goalColor + '15', borderColor: goalColor + '30' }]}>
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
            <View style={[styles.successCircle, { backgroundColor: Colors.success + '15', borderColor: Colors.success + '30' }]}>
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
              onPress={showPermissionPopup}
              activeOpacity={0.85}
            >
              <Bell size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.ctaText}>Enable reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
              <Text style={styles.skipText}>Maybe later</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {showPopup && (
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Animated.View style={[styles.popup, {
            opacity: popupOpacity,
            transform: [{ scale: popupScale }],
          }]}>
            <View style={styles.popupIconWrap}>
              <View style={[styles.popupIcon, { backgroundColor: goalColor + '12' }]}>
                <Bell size={28} color={goalColor} strokeWidth={2} />
              </View>
            </View>

            <Text style={styles.popupTitle}>"Volera" Would Like to{'\n'}Send You Notifications</Text>
            <Text style={styles.popupBody}>
              Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
            </Text>

            <View style={styles.popupDivider} />

            <TouchableOpacity onPress={handleDontAllow} activeOpacity={0.7} style={styles.popupBtn}>
              <Text style={styles.popupBtnText}>Don't Allow</Text>
            </TouchableOpacity>

            <View style={styles.popupDivider} />

            <TouchableOpacity onPress={handleAllow} activeOpacity={0.7} style={styles.popupBtn}>
              <Text style={[styles.popupBtnText, styles.popupBtnPrimary]}>Allow</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  glowCircle: {
    position: 'absolute' as const,
    top: -60,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowTop: {
    position: 'absolute' as const,
    bottom: -100,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(74,144,217,0.04)',
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
    borderColor: '#0B1A2E',
  },
  bellBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: '#FFFFFF',
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: '#F1F5F9',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
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
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 2,
  },
  featureSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  previewTime: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
  previewBody: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
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
    color: 'rgba(255,255,255,0.85)',
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
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  skipBtn: {
    alignItems: 'center' as const,
    paddingTop: 16,
    paddingBottom: 4,
  },
  skipText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.25)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  popup: {
    backgroundColor: 'rgba(255,255,255,0.95)',
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
