import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NAVLINKS = [
  { to: '/', label: 'Home' },
  { to: '/stuff', label: 'Stuff' },
];

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

function Navbar() {
  return (
    <NavbarWrapper>
      <h1>Navbar</h1>
      <ul>
        {NAVLINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to}>{label}</NavLink>
          </li>
        ))}
      </ul>
    </NavbarWrapper>
  );
}

export default Navbar;
