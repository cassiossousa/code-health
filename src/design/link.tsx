import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const Link = styled.a`
  color: ${({ theme }) => theme.link.default};
  text-decoration: none;

  &:visited {
    color: ${({ theme }) => theme.link.visited};
  }

  &:hover {
    color: ${({ theme }) => theme.link.hover};
  }

  &:focus-visible {
    color: ${({ theme }) => theme.link.focus};
    outline: 2px solid ${({ theme }) => theme.link.focus};
    outline-offset: -2px;
  }

  &[aria-current='page'],
  &[aria-current='page']:visited {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.link.active};
  }
`;

export const RouterLink = styled(NavLink)`
  color: ${({ theme }) => theme.link.default};
  text-decoration: none;

  &:visited {
    color: ${({ theme }) => theme.link.visited};
  }

  &:hover {
    color: ${({ theme }) => theme.link.hover};
  }

  &:focus-visible {
    color: ${({ theme }) => theme.link.focus};
    outline: 2px solid ${({ theme }) => theme.link.focus};
    outline-offset: -2px;
  }

  &[aria-current='page'],
  &[aria-current='page']:visited {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.link.active};
  }
`;
