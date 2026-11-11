import { css } from 'styled-components';

export const linkStyles = css`
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
