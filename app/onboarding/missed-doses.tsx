import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Shuffle, TrendingUp, CheckCircle, X, AlertCircle } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const ICON_MAP = {
  'one-two': AlertTriangle,
  'three-four': Shuffle,
  'five-six': TrendingUp,
  'every-day': CheckCircle,
} as const;

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

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const [showHonestyModal, setShowHonestyModal] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const openModal = useCallback(() => {
    setShowHonestyModal(true);
    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 140 }).start();
  }, [modalAnim]);

  const closeModal = useCallback((chosenId: string) => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      setShowHonestyModal(false);
      setSelected(chosenId);
    });
  }, [modalAnim]);

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
          const IconComponent = ICON_MAP[option.id];
          return (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
                testID={`missed-doses-${option.id}`}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <IconComponent size={20} color={isSelected ? Colors.blue : Colors.mediumGray} strokeWidth={2} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showHonestyModal} transparent animationType="none" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: modalAnim, transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => { setShowHonestyModal(false); }} activeOpacity={0.7}>
              <X size={20} color={Colors.mediumGray} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <AlertCircle size={28} color={Colors.blue} strokeWidth={1.8} />
            </View>

            <Text style={styles.modalTitle}>Be honest with yourself</Text>
            <Text style={styles.modalBody}>
              Most people overestimate their consistency. Even forgetting once a week means your supplements aren't building up properly in your system.
            </Text>
            <Text style={styles.modalPrompt}>How often do you really take them?</Text>

            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOption} onPress={() => closeModal('five-six')} activeOpacity={0.7}>
                <TrendingUp size={18} color={Colors.navy} strokeWidth={2} />
                <Text style={styles.modalOptionText}>Almost every day, maybe miss one</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => closeModal('three-four')} activeOpacity={0.7}>
                <Shuffle size={18} color={Colors.navy} strokeWidth={2} />
                <Text style={styles.modalOptionText}>I skip a couple days a week</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOption, styles.modalOptionLast]} onPress={() => closeModal('every-day')} activeOpacity={0.7}>
                <CheckCircle size={18} color={Colors.navy} strokeWidth={2} />
                <Text style={styles.modalOptionText}>Truly every single day</Text>
              </TouchableOpacity>
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EEED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconWrapSelected: {
    backgroundColor: '#E0E8F5',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    width: '100%' as const,
    maxWidth: 380,
  },
  modalClose: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EEED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.navy,
    marginBottom: 10,
  },
  modalBody: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
    marginBottom: 18,
  },
  modalPrompt: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  modalOptions: {
    gap: 0,
  },
  modalOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
});
