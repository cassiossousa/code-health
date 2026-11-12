import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { theme } from '../design/theme';
import Layout from './layout';

describe('Layout navigation', () => {
  it('uses the AppBar links to navigate and marks the active page', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<p>Home content</p>} />
              <Route
                path="repository-analysis"
                element={<p>Analysis content</p>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const analyzeLink = screen.getByRole('link', { name: 'Analyze' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(analyzeLink).not.toHaveAttribute('aria-current', 'page');

    await user.click(analyzeLink);

    expect(screen.getByText('Analysis content')).toBeInTheDocument();
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(analyzeLink).toHaveAttribute('aria-current', 'page');
  });
});
