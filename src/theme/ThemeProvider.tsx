import { ThemeProvider as StyledThemeProvider } from '@shopify/restyle';
import { theme } from './theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}
