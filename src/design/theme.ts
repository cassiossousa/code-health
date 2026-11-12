import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#0f766e',
    background: '#f0f7f6',
    surface: '#ffffff',
    text: '#173b39',
    border: '#d3e3e1',
  },
  link: {
    default: '#b6e3de',
    visited: '#c5d5a5',
    hover: '#d8f0e9',
    focus: '#ffe08a',
    active: '#f4f1d5',
  },
  spacing: (factor: number) => `${factor * 8}px`,
  fontFamily: {
    sansSerif:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  borderRadius: {
    round: '0.5rem',
  },
  boxShadow: {
    md: '0 2px 4px rgba(23, 59, 57, 0.1)',
  },
} as const;

type AppTheme = typeof theme;

declare module 'styled-components' {
  // Keep the theme shape inferred from the source object.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fontFamily.sansSerif};
    margin: 0;
    padding: ${({ theme }) => theme.spacing(2.5)};
  }
`;
