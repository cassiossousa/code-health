import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';

import { theme } from './theme';
import { Link } from './link';

describe('Link', () => {
  it('applies shared link styles without requiring a router', () => {
    render(
      <ThemeProvider theme={theme}>
        <Link href="https://example.com">External</Link>
      </ThemeProvider>,
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveStyle({
      color: theme.link.default,
      textDecoration: 'none',
    });
  });
});
