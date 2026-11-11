import styled from 'styled-components';
import { ROUTES } from '../routes';
import { RouterLink } from '../design/link';

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
`;

const NavbarLink = styled(RouterLink)`
  font-weight: bold;
  padding: ${({ theme }) => theme.spacing[5]};
  display: inline-block;
`;

interface NavbarProps {
  links?: { to: string; label: string }[];
}

function Navbar({ links = ROUTES }: NavbarProps) {
  return (
    <NavbarWrapper>
      <ul>
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavbarLink to={to}>{label}</NavbarLink>
          </li>
        ))}
      </ul>
    </NavbarWrapper>
  );
}

export default Navbar;
