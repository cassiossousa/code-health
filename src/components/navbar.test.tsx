import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Navbar from './navbar';
import { NAVLINKS } from '../routes';

describe('Navbar', () => {
  const renderNavbar = (initialEntry = '/') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Navbar />
      </MemoryRouter>,
    );

  it('renders the navigation links', () => {
    renderNavbar();

    NAVLINKS.forEach(({ to, label }) => {
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

    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Stuff' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
