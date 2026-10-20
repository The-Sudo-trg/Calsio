/**
 * CALSIO — "AGRA MODERN" design system tokens.
 * Single source of truth: master prompt §5. Keep web CSS vars in ./global.css in sync.
 */
import { Platform } from 'react-native';

export const Palette = {
  clay: '#C4552D',      // Agra Clay — primary CTA
  clayPressed: '#A8471F',
  ivory: '#F7F1E8',     // Ivory Kraft — background
  ivoryCard: '#FFFDF8',
  charcoal: '#1C1B1A',  // Charcoal Last — text
  ink70: 'rgba(28, 27, 26, 0.70)',
  ink50: 'rgba(28, 27, 26, 0.50)',
  jodhpur: '#274B6D',   // Jodhpur Blue — links/secondary
  success: '#1F7A4D',   // Success Green — in-stock, paid
  pelig: '#FBF0E9',     // clay-tinted surface for highlight cards
} as const;

export const Colors = {
  light: {
    text: Palette.charcoal,
    background: Palette.ivory,
    backgroundElement: Palette.ivoryCard,
    backgroundSelected: '#EFE6D8',
    textSecondary: Palette.ink70,
    textMuted: Palette.ink50,
    primary: Palette.clay,
    primaryPressed: Palette.clayPressed,
    link: Palette.jodhpur,
    success: Palette.success,
    highlight: Palette.pelig,
  },
  dark: {
    text: '#F2EDE4',
    background: '#171615',
    backgroundElement: '#211F1D',
    backgroundSelected: '#2C2A27',
    textSecondary: 'rgba(242, 237, 228, 0.70)',
    textMuted: 'rgba(242, 237, 228, 0.50)',
    primary: Palette.clay,
    primaryPressed: Palette.clayPressed,
    link: '#7FA3C7',
    success: '#3AA06F',
    highlight: '#2A1712',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  display: 'SpaceGrotesk',      // headings — multiple weights loaded in _layout
  body: 'Inter',
  hindi: 'NotoSansDevanagari',
  fallback: 'system-ui',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Type = {
  /** Display/headings — Space Grotesk */
  h1: { fontFamily: Fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.2 },
  h3: { fontFamily: Fonts.display, fontSize: 17, lineHeight: 22 },
  eyebrow: { fontFamily: Fonts.display, fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
  /** Body/UI — Inter */
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 15, letterSpacing: 0.3 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 14,   // §5: 14px card radius
  pill: 999,
  stamp: 6,
} as const;

export const Shadow = {
  card: PlatformShadow(),
} as const;

function PlatformShadow() {
  return {
    ios: {
      shadowColor: Palette.charcoal,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    web: {
      boxShadow: '0 4px 10px rgba(28, 27, 26, 0.08)',
    },
  };
}

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
