import { createText, createBox } from '@shopify/restyle';

export const theme = {
  colors: {
    background: '#F5F9FF',
    surface: '#FFFFFF',
    primary: '#0B71EB',
    secondary: '#1C6D8A',
    accent: '#1FB0AF',
    success: '#27AE60',
    warning: '#F2994A',
    error: '#EB5757',
    text: '#1F2A37',
    textMuted: '#7A869A',
    border: '#E6ECF4',
    card: '#FFFFFF',
    shadow: 'rgba(20, 43, 107, 0.08)',
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
    header: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: 'text' as const,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: 'text' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: 'text' as const,
    },
    secondary: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'textMuted' as const,
    },
    label: {
      fontSize: 12,
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
