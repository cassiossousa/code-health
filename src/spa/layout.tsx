import { Outlet } from 'react-router';
import Card from '../design/card';
import Navbar from '../components/navbar';

function Layout() {
  return (
    <div>
      <h1>Code Health</h1>
      <Navbar />
      <Card>
        <Outlet />
      </Card>
    </div>
  );
}

export default Layout;
