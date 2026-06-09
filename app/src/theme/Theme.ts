// theme.ts
export const colors = {
  primary:       '#185FA5',
  primaryLight:  '#E6F1FB',
  primaryMid:    '#B5D4F4',
  primaryDark:   '#0C447C',

  success:       '#1D9E75',
  successLight:  '#E1F5EE',

  warning:       '#BA7517',
  warningLight:  '#FAEEDA',

  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textTertiary:  '#94A3B8',

  bgPrimary:     '#FFFFFF',
  bgSecondary:   '#F8FAFC',
  bgTertiary:    '#F1F5F9',

  border:        '#E2E8F0',
  borderStrong:  '#CBD5E1',
  error:         '#EF4444',
  accent:        '#F59E0B',
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const typography = {
  h1:      { fontSize: 22, fontWeight: '600' as const, color: colors.textPrimary },
  h2:      { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  h3:      { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  body:    { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
  label:   { fontSize: 11, fontWeight: '500' as const, color: colors.textTertiary },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};

const Theme = {
  Colors: colors,
  colors: colors,
  radius: radius,
  Radius: radius,
  spacing: spacing,
  Spacing: spacing,
  typography: typography,
  Typography: typography,
  shadow: shadow,
  Shadow: shadow
};

export default Theme;
