import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const PAD_HEIGHT = 180;

export default function SignatureScreen() {
  const router = useRouter();
  const { userName } = useAppState();
  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState('');
  const pathRef = useRef('');
  const lastPoint = useRef({ x: 0, y: 0 });

  const hasSigned = completedPaths.length > 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        pathRef.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
        lastPoint.current = { x: locationX, y: locationY };
        setActivePath(pathRef.current);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const dx = locationX - lastPoint.current.x;
        const dy = locationY - lastPoint.current.y;
        if (dx * dx + dy * dy > 16) {
          lastPoint.current = { x: locationX, y: locationY };
          pathRef.current += ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
          setActivePath(pathRef.current);
        }
      },
      onPanResponderRelease: () => {
        if (pathRef.current && pathRef.current.includes('L')) {
          const finished = pathRef.current;
          setCompletedPaths(prev => [...prev, finished]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        pathRef.current = '';
        setActivePath('');
      },
    })
  ).current;

  const handleClear = useCallback(() => {
    setCompletedPaths([]);
    setActivePath('');
    pathRef.current = '';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <OnboardingScreen
      step={9}
      totalSteps={9}
      ctaText="I commit"
      ctaEnabled={hasSigned}
      onCta={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/onboarding/notification' as any);
      }}
    >
      <View style={styles.center}>
        <Text style={styles.headline}>Seal your commitment.</Text>
        <Text style={styles.subline}>
          Sign below — this is your promise to yourself.
        </Text>

        <View style={styles.padContainer}>
          <View style={styles.padHeader}>
            <Text style={styles.padLabel}>YOUR SIGNATURE</Text>
            {hasSigned && (
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.signaturePad} {...panResponder.panHandlers}>
            <Svg width="100%" height={PAD_HEIGHT}>
              {completedPaths.map((d, i) => (
                <Path key={i} d={d} stroke={Colors.navy} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {activePath ? (
                <Path d={activePath} stroke={Colors.navy} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </Svg>

            {!hasSigned && !activePath && (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Sign here</Text>
              </View>
            )}

            <View style={styles.signatureLine} />
          </View>
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.contractText}>
            "I, {userName || '___'}, commit to 30 days of consistency. I won't quit before the science kicks in."
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginBottom: 8,
  },
  subline: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    lineHeight: 22,
    marginBottom: 24,
  },
  padContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  padHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  padLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
  },
  clearText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.blue,
  },
  signaturePad: {
    height: PAD_HEIGHT,
    marginHorizontal: 16,
    position: 'relative' as const,
  },
  placeholder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  placeholderText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.border,
  },
  signatureLine: {
    position: 'absolute' as const,
    bottom: 20,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  contractCard: {
    backgroundColor: Colors.blueBg,
    borderRadius: 12,
    padding: 16,
  },
  contractText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
});
