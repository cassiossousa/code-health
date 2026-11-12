import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { theme } from './theme';
import Typography from './typography';

describe('Typography', () => {
  it.each([
    ['span', 'SPAN', '16px', '400', '1.5', '0'],
    ['p', 'P', '16px', '400', '1.5', '0'],
    ['h1', 'H1', '36px', '700', '1.2', '-0.02em'],
    ['h2', 'H2', '30px', '700', '1.2', '-0.015em'],
    ['h3', 'H3', '24px', '600', '1.25', '0'],
  ] as const)(
    'renders the %s variant as <%s> with its type styles',
    (variant, tagName, fontSize, fontWeight, lineHeight, letterSpacing) => {
      render(
        <ThemeProvider theme={theme}>
          <Typography variant={variant}>Text</Typography>
        </ThemeProvider>,
      );

      const text = screen.getByText('Text');
      expect(text.tagName).toBe(tagName);
      expect(text).toHaveStyle({
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
      });
    },
  );

  it('forwards supported element props', () => {
    render(
      <ThemeProvider theme={theme}>
        <Typography variant="span" id="inline-copy" title="Helpful text">
          Inline text
        </Typography>
      </ThemeProvider>,
    );

    expect(screen.getByText('Inline text')).toHaveAttribute(
      'id',
      'inline-copy',
    );
    expect(screen.getByText('Inline text')).toHaveAttribute(
      'title',
      'Helpful text',
    );
  });
});
