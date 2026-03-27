import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { NOTIFICATION_EXAMPLES } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const useNative = Platform.OS !== 'web';

export default function SimNotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();
  const goalColor = Colors.category[goal] || Colors.blue;
  const notifExample = NOTIFICATION_EXAMPLES[goal] || "Time to check in. Your body is listening.";
  const displayName = userName ? userName.split(' ')[0] : '';

  const [phase, setPhase] = useState<'waiting' | 'notification' | 'opening'>('waiting');

  const screenDim = useRef(new Animated.Value(0)).current;
  const lockTimeAnim = useRef(new Animated.Value(0)).current;
  const notifSlide = useRef(new Animated.Value(-120)).current;
  const notifOpacity = useRef(new Animated.Value(0)).current;
  const notifGlow = useRef(new Animated.Value(0)).current;
  const tapHintAnim = useRef(new Animated.Value(0)).current;
  const screenFlash = useRef(new Animated.Value(0)).current;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(screenDim, { toValue: 1, duration: 800, useNativeDriver: useNative }),
      Animated.timing(lockTimeAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(1200),
    ]).start(() => {
      setPhase('notification');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      Animated.parallel([
        Animated.spring(notifSlide, {
          toValue: 0,
          useNativeDriver: useNative,
          damping: 14,
          stiffness: 180,
          mass: 0.8,
        }),
        Animated.timing(notifOpacity, { toValue: 1, duration: 300, useNativeDriver: useNative }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(notifGlow, { toValue: 1, duration: 1500, useNativeDriver: useNative }),
            Animated.timing(notifGlow, { toValue: 0, duration: 1500, useNativeDriver: useNative }),
          ])
        ).start();

        setTimeout(() => {
          Animated.timing(tapHintAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }).start();
        }, 1500);
      });
    });
  }, []);

  const handleTapNotification = useCallback(() => {
    if (phase !== 'notification') return;
    setPhase('opening');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(screenFlash, { toValue: 1, duration: 200, useNativeDriver: useNative }),
      Animated.delay(400),
    ]).start(() => {
      router.push('/onboarding/sim-checkin' as any);
    });
  }, [phase, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.lockScreen, {
        opacity: screenDim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
      }]}>
        <View style={[styles.statusBar, { paddingTop: insets.top }]}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTime}>{timeStr.split(' ')[0]}</Text>
          </View>
          <View style={styles.notch} />
          <View style={styles.statusRight}>
            <View style={styles.signalBars}>
              <View style={[styles.bar, styles.barFull]} />
              <View style={[styles.bar, styles.barFull]} />
              <View style={[styles.bar, styles.barMed]} />
              <View style={[styles.bar, styles.barLow]} />
            </View>
            <View style={styles.battery}>
              <View style={styles.batteryFill} />
            </View>
          </View>
        </View>

        <Animated.View style={[styles.clockSection, {
          opacity: lockTimeAnim,
          transform: [{ translateY: lockTimeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <Text style={styles.lockTime}>{timeStr.split(' ')[0]}</Text>
          <Text style={styles.lockDate}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.notificationBanner, {
            transform: [{ translateY: notifSlide }],
            opacity: notifOpacity,
          }]}
        >
          <Animated.View style={[styles.notifGlowBorder, {
            opacity: notifGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }),
            borderColor: goalColor,
          }]} />

          <View
            style={styles.notifTouchable}
            onTouchEnd={handleTapNotification}
          >
            <View style={styles.notifHeader}>
              <View style={[styles.notifAppIcon, { backgroundColor: goalColor }]}>
                <Text style={styles.notifAppIconText}>V</Text>
              </View>
              <Text style={styles.notifAppName}>VOLERA</Text>
              <Text style={styles.notifTimeLabel}>now</Text>
            </View>
            <Text style={styles.notifTitle}>
              {displayName ? `Hey ${displayName}` : 'Hey'}, time for your check-in
            </Text>
            <Text style={styles.notifBody} numberOfLines={2}>
              {notifExample}
            </Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.tapHint, {
          opacity: tapHintAnim,
          transform: [{ translateY: tapHintAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        }]}>
          tap notification to open
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.flashOverlay, {
        opacity: screenFlash,
      }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  lockScreen: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  statusBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  statusLeft: {
    flex: 1,
  },
  statusTime: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  notch: {
    width: 120,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  statusRight: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  signalBars: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 1.5,
    height: 12,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
  barFull: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  barMed: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  barLow: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  battery: {
    width: 22,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 1.5,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
    width: '70%',
  },
  clockSection: {
    alignItems: 'center' as const,
    marginTop: 60,
    marginBottom: 40,
  },
  lockTime: {
    fontFamily: Fonts.heading,
    fontSize: 72,
    color: '#FFFFFF',
    letterSpacing: -3,
    lineHeight: 80,
  },
  lockDate: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  notificationBanner: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(40,44,60,0.92)',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  notifGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  notifTouchable: {
    padding: 16,
  },
  notifHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  notifAppIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  notifAppIconText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: '#FFFFFF',
  },
  notifAppName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
    letterSpacing: 0.5,
  },
  notifTimeLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  notifTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notifBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },
  tapHint: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center' as const,
    marginTop: 28,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
});
