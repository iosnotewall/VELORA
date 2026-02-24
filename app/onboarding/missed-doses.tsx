import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OPTIONS = [
  {
    id: 'one-two' as const,
    label: '1-2 days a week',
    desc: 'I forget more than I remember',
    value: 2,
  },
  {
    id: 'three-four' as const,
    label: '3-4 days a week',
    desc: 'I try but life gets in the way',
    value: 4,
  },
  {
    id: 'five-six' as const,
    label: '5-6 days a week',
    desc: 'Pretty good, just slip sometimes',
    value: 6,
  },
  {
    id: 'every-day' as const,
    label: 'Every single day',
    desc: 'Locked in, never miss',
    value: 7,
  },
];

const HONESTY_OPTIONS = [
  { id: 'five-six', label: 'Most days, I slip sometimes', emoji: '🤷‍♀️' },
  { id: 'three-four', label: 'I skip a few days', emoji: '😬' },
  { id: 'every-day', label: 'No really — every day', emoji: '💪' },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const [showHonestyModal, setShowHonestyModal] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const openModal = useCallback(() => {
    setShowHonestyModal(true);
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(modalAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 22, stiffness: 180 }),
    ]).start();
  }, [modalAnim, backdropAnim]);

  const closeModal = useCallback((chosenId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setShowHonestyModal(false);
      setSelected(chosenId);
    });
  }, [modalAnim, backdropAnim]);

  const dismissModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setShowHonestyModal(false);
    });
  }, [modalAnim, backdropAnim]);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (id === 'every-day') {
      openModal();
      return;
    }

    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims, openModal]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const option = OPTIONS.find(o => o.id === selected);
    if (!option) return;

    updateState({ missedDoses: option.value });

    router.push('/onboarding/impact' as any);
  }, [selected, updateState, router]);

  return (
    <OnboardingScreen step={1} totalSteps={9} ctaText="Continue" ctaEnabled={selected !== null} onCta={handleContinue}>
      <Text style={styles.eyebrow}>be honest</Text>
      <Text style={styles.headline}>How often do you actually take your supplements?</Text>

      <View style={styles.optionsWrap}>
        {OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
                testID={`missed-doses-${option.id}`}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showHonestyModal} transparent animationType="none" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={styles.modalOverlayTouch} activeOpacity={1} onPress={dismissModal} />
          </Animated.View>

          <Animated.View style={[
            styles.modalSheet,
            {
              opacity: modalAnim,
              transform: [{
                scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
              }],
            },
          ]}>
            <TouchableOpacity style={styles.closeBtn} onPress={dismissModal} activeOpacity={0.7}>
              <X size={16} color={Colors.mediumGray} strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={styles.sheetEmoji}>🪞</Text>
            <Text style={styles.sheetTitle}>Are you sure?</Text>
            <Text style={styles.sheetSub}>92% of people overestimate this.</Text>

            <View style={styles.sheetOptions}>
              {HONESTY_OPTIONS.map((opt, i) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sheetOption,
                    i === HONESTY_OPTIONS.length - 1 && styles.sheetOptionLast,
                  ]}
                  onPress={() => closeModal(opt.id)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.sheetOptionEmoji}>{opt.emoji}</Text>
                  <Text style={styles.sheetOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 10,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 24,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 18, 35, 0.55)',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 24,
    width: '100%' as const,
    maxWidth: 340,
    alignItems: 'center' as const,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 20px 60px rgba(0,0,0,0.18)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.18,
          shadowRadius: 30,
          elevation: 24,
        }),
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sheetEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  sheetSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  sheetOptions: {
    width: '100%' as const,
  },
  sheetOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderRadius: 14,
    backgroundColor: Colors.cream,
  },
  sheetOptionLast: {
    marginBottom: 12,
  },
  sheetOptionEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  sheetOptionText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
});
