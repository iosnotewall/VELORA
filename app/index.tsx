import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';

export default function IndexScreen() {
  const { onboardingComplete, isLoading } = useAppState();

  console.log('[Index] isLoading:', isLoading, 'onboardingComplete:', onboardingComplete);

  if (isLoading) {
    return <View style={styles.container} />;
  }

  if (onboardingComplete) {
    console.log('[Index] Redirecting to tabs');
    return <Redirect href={"/(tabs)/today" as any} />;
  }

  console.log('[Index] Redirecting to onboarding');
  return <Redirect href={"/onboarding/trajectory" as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },
});
