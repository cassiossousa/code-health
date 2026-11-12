import { Outlet } from 'react-router';
import Card from '../design/card';
import Navbar from '../components/navbar';
import { Row, Col } from '../design/grid';
import Typography from '../design/typography';

interface PageProps {
  title?: string;
}

function Layout({ title = 'Code Health' }: PageProps) {
  return (
    <Row>
      <Col>
        <Typography variant="h1">{title}</Typography>
      </Col>
      <Col>
        <Navbar />
      </Col>
      <Col>
        <Card>
          <Outlet />
        </Card>
      </Col>
    </Row>
  );
}

export default Layout;
