import { NavLink, Outlet } from 'react-router';
import styled from 'styled-components';

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

const Content = styled.div`
  background-color: #fff;
  padding: 20px;

  h2 {
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 10px;
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
      <Content>
        <Outlet />
      </Content>
    </div>
  );
}

export default Layout;
