import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { NAVLINKS } from '../routes';

const NavbarWrapper = styled.nav`
  h1 {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  ul {
    background-color: ${({ theme }) => theme.colors.text};
    padding: 0;
    margin: 0;
  }

  li {
    display: inline;
    list-style-type: none;
    margin: 0;
  }

  li a {
    color: ${({ theme }) => theme.colors.white};
    font-weight: bold;
    text-decoration: none;
    padding: ${({ theme }) => theme.spacing[5]};
    display: inline-block;
  }

  li a.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

interface NavbarProps {
  links?: { to: string; label: string }[];
}

function Navbar({ links = NAVLINKS }: NavbarProps) {
  return (
    <NavbarWrapper>
      <ul>
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to}>{label}</NavLink>
          </li>
        ))}
      </ul>
    </NavbarWrapper>
  );
}

export default Navbar;
