import { Text, TextProps, useColorScheme } from 'react-native';

import { Colors, Fonts, Type, ThemeColor } from '@/constants/theme';

type CalTextProps = TextProps & {  /** Token typography preset from `Type` */
  variant?: keyof typeof Type;
  /** Optional theme token override (e.g. "primary", "success") */
  color?: ThemeColor | string;
  /** Hindi strings auto-render in Noto Sans Devanagari */
  hindi?: boolean;
};

export default function CalText({ variant = 'body', color, hindi, style, ...rest }: CalTextProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const preset = Type[variant];

  let resolvedColor: string = colors.text;
  if (color) {
    resolvedColor = (colors as Record<string, string>)[color] ?? color;
  }

  const fontFamily = hindi ? Fonts.hindi : preset.fontFamily;

  return <Text style={[preset, { fontFamily, color: resolvedColor }, style]} {...rest} />;
}
