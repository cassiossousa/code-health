import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Navbar from './navbar';

describe('Navbar', () => {
  const renderNavbar = (initialEntry = '/') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Navbar />
      </MemoryRouter>,
    );

  it('renders the heading and navigation links', () => {
    renderNavbar();

    expect(
      screen.getByRole('heading', { name: 'Navbar', level: 1 }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );

    expect(screen.getByRole('link', { name: 'Stuff' })).toHaveAttribute(
      'href',
      '/stuff',
    );
  });

  it.each([
    ['/', 'Home'],
    ['/stuff', 'Stuff'],
  ])('marks %s as the active route', (route, activeLink) => {
    renderNavbar(route);

    const inactiveLink = activeLink === 'Home' ? 'Stuff' : 'Home';

    expect(screen.getByRole('link', { name: activeLink })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(
      screen.getByRole('link', { name: inactiveLink }),
    ).not.toHaveAttribute('aria-current', 'page');
  });

  it('updates the active link when the user navigates', async () => {
    const user = userEvent.setup();

    renderNavbar('/');
    await user.click(screen.getByRole('link', { name: 'Stuff' }));

    expect(screen.getByRole('link', { name: 'Stuff' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
