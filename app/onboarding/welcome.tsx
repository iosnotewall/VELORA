import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Fonts } from '@/constants/fonts';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const advancedRef = React.useRef(false);

  const advance = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    router.push('/onboarding/slap' as any);
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={advance}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.center}>
          <Text style={styles.text}>hey</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.tapText}>tap to continue</Text>
          <ArrowRight size={18} color="rgba(255,255,255,0.45)" strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  text: {
    fontFamily: Fonts.heading,
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    paddingHorizontal: 28,
    paddingBottom: 20,
    gap: 8,
  },
  tapText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
});
