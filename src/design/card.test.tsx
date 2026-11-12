import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';

import { theme } from './theme';
import Card from './card';

describe('Card', () => {
  it('forwards native div props and its ref', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <ThemeProvider theme={theme}>
        <Card
          ref={ref}
          aria-label="Repository details"
          className="custom-card"
          data-testid="card"
          role="region"
        >
          Card content
        </Card>
      </ThemeProvider>,
    );

    const card = screen.getByRole('region', { name: 'Repository details' });
    expect(card).toHaveClass('custom-card');
    expect(card).toHaveTextContent('Card content');
    expect(card).toHaveStyle({
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      boxSizing: 'border-box',
      minWidth: '0',
    });
    expect(ref.current).toBe(card);
  });
});
