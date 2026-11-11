import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { NAVLINKS } from '../routes';

const NavbarWrapper = styled.nav`
  h1 {
    margin-bottom: 0.5rem;
  }

  ul {
    background-color: #111;
    padding: 0;
    margin: 0;
  }

  li {
    display: inline;
    list-style-type: none;
    margin: 0;
  }

  li a {
    color: #fff;
    font-weight: bold;
    text-decoration: none;
    padding: 20px;
    display: inline-block;
  }

  li a.active {
    background-color: #0099ff;
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
