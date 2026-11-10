import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <div className="navbar">
      <h1>Navbar</h1>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/stuff">Stuff</NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
