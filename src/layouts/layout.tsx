import { NavLink, Outlet } from 'react-router';
import styled from 'styled-components';
import Card from '../components/card';

const Header = styled.div`
  ul {
    background-color: #111;
    padding: 0;
  }

  ul li {
    display: inline;
    list-style-type: none;
    margin: 0;
  }

  ul li a {
    color: #fff;
    font-weight: bold;
    text-decoration: none;
    padding: 20px;
    display: inline-block;
  }

  ul li a.active {
    background-color: #0099ff;
  }
`;

function Layout() {
  return (
    <div>
      <h1>Simple SPA</h1>
      <Header>
        <ul>
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/stuff">Stuff</NavLink>
          </li>
        </ul>
      </Header>
      <Card>
        <Outlet />
      </Card>
    </div>
  );
}

export default Layout;
