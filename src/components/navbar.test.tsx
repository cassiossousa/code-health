import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';

import Navbar from './navbar';
import { ROUTES } from '../routes';
import { theme } from '../design/theme';

describe('Navbar', () => {
  const renderNavbar = (initialEntry = '/') =>
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>,
    );

  it('renders the navigation links', () => {
    renderNavbar();

    ROUTES.forEach(({ to, label }) => {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        to,
      );
    });
  });

  it('updates the active link when the user navigates', async () => {
    const user = userEvent.setup();
    renderNavbar('/');

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Stuff' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.click(screen.getByRole('link', { name: 'Stuff' }));

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const stuffLink = screen.getByRole('link', { name: 'Stuff' });

    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(stuffLink).toHaveAttribute('aria-current', 'page');
    expect(stuffLink).toHaveStyle({
      color: theme.link.active,
      backgroundColor: theme.colors.primary,
    });
  });
});
