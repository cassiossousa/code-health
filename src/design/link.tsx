import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { linkStyles } from './link-styles';

export const Link = styled.a`
  ${linkStyles}
`;

export const RouterLink = styled(NavLink)`
  ${linkStyles}
`;
