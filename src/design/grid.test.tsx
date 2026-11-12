import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';

import { theme } from './theme';
import { Col, Row } from './grid';

describe('Row and Col', () => {
  it('creates twelve equal columns', () => {
    render(
      <ThemeProvider theme={theme}>
        <Row data-testid="row" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('row')).toHaveStyle({
      gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    });
    expect(screen.getByTestId('row')).toHaveStyle({
      gap: theme.spacing[4],
    });
  });

  it('uses the gap configured on the row', () => {
    render(
      <ThemeProvider theme={theme}>
        <Row gap="2rem" data-testid="row" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('row')).toHaveStyle({
      gap: '2rem',
    });
  });

  it.each([
    [undefined, 'span 12'],
    [4, 'span 4'],
    [12, 'span 12'],
  ] as const)('spans %s columns', (colSpan, expectedSpan) => {
    render(
      <ThemeProvider theme={theme}>
        <Row>
          <Col data-testid="column" colSpan={colSpan} />
        </Row>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('column')).toHaveStyle({
      gridColumn: expectedSpan,
    });
  });
});
