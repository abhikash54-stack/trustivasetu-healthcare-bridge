import { createText, createBox } from '@shopify/restyle';

export const BRAND = {
  primary: '#07111f',
  primaryDark: '#040a12',
  primaryLight: '#1a2942',
  accent: '#bef264',
  drawerBg: '#07111f',
  drawerActive: 'rgba(190, 242, 100, 0.18)',
  drawerBorder: 'rgba(255, 255, 255, 0.08)',
  drawerText: '#FFFFFF',
  drawerMuted: 'rgba(255, 255, 255, 0.60)',
  headerBg: '#07111f',
  background: '#07111f',
  metricGreen: '#bef264',
  metricAccent: '#bef264',
  metricAmber: '#F39C12',
  metricDark: '#040a12',
} as const;

export const theme = {
  colors: {
    background: '#F0F7F3',
    surface: '#FFFFFF',
    primary: '#006B3C',
    secondary: '#005C30',
    accent: '#00A855',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    text: '#1A2D1E',
    textMuted: '#5A7A63',
    border: '#C8DFD0',
    card: '#FFFFFF',
    shadow: 'rgba(0, 75, 40, 0.08)',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadii: {
    s: 10,
    m: 16,
    l: 24,
  },
  textVariants: {
    defaults: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: 'text' as const,
    },
    header: {
      fontSize: 26,
      fontWeight: '700' as const,
      color: 'text' as const,
    },
    title: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: 'text' as const,
    },
    body: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: 'text' as const,
    },
    secondary: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: 'textMuted' as const,
    },
    label: {
      fontSize: 11,
      fontWeight: '600' as const,
      color: 'textMuted' as const,
    },
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
};

export type Theme = typeof theme;

export const Text = createText<Theme>();
export const Box = createBox<Theme>();
