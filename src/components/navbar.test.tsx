import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Navbar from './navbar';

describe('Navbar', () => {
  it('renders the heading and navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

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
    render(
      <MemoryRouter initialEntries={[route]}>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: activeLink })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('updates the active link when navigating', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Stuff' }));

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
