import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { REVIEWS_DATA } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(REVIEWS_DATA.map(() => new Animated.Value(0))).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      ...cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 120 })
      ),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <Animated.Text style={[styles.headline, fadeSlide(titleAnim)]}>
        Women who committed{'\n'}saw real results.
      </Animated.Text>

      <View style={styles.cards}>
        {REVIEWS_DATA.map((review, index) => (
          <Animated.View key={review.name} style={[styles.reviewCard, fadeSlide(cardAnims[index])]}>
            <View style={styles.starsRow}>
              {Array.from({ length: review.stars }).map((_, i) => (
                <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
              ))}
            </View>
            <Text style={styles.reviewText}>"{review.text}"</Text>
            <Text style={styles.reviewName}>— {review.name}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Continue" onPress={() => router.push('/onboarding/paywall' as any)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    marginBottom: 28,
  },
  cards: {
    flex: 1,
    gap: 14,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  starsRow: {
    flexDirection: 'row' as const,
    gap: 2,
    marginBottom: 10,
  },
  reviewText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.mediumGray,
  },
  footer: {
    paddingTop: 16,
  },
});
