import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const { onboardingComplete, isLoading } = useAppState();
  useEffect(() => {
    if (isLoading) return;

    try {
      if (onboardingComplete) {
        console.log('Index: Navigating to tabs');
        router.replace('/(tabs)/today' as any);
      } else {
        console.log('Index: Navigating to onboarding');
        router.replace('/onboarding/welcome' as any);
      }
    } catch (e) {
      console.log('Index: Navigation error', e);
    }
  }, [isLoading, onboardingComplete, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.navy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
