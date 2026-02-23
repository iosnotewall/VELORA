import { Platform } from 'react-native';

const SYSTEM_FONT = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}) as string;

const SYSTEM_FONT_MEDIUM = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif-medium',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}) as string;

export const Fonts = {
  heading: 'Figtree_700Bold' as const,
  headingSemiBold: 'Figtree_600SemiBold' as const,
  body: SYSTEM_FONT,
  bodyMedium: SYSTEM_FONT_MEDIUM,
  bodySemiBold: SYSTEM_FONT_MEDIUM,
  bodyBold: SYSTEM_FONT_MEDIUM,

  playfairBold: 'Figtree_700Bold' as const,
  dmRegular: SYSTEM_FONT,
  dmMedium: SYSTEM_FONT_MEDIUM,
  dmSemiBold: SYSTEM_FONT_MEDIUM,
  dmBold: SYSTEM_FONT_MEDIUM,
};
