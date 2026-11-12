import { Link } from 'react-router';
import Typography from '../design/typography';

function NotFound() {
  return (
    <div>
      <Typography variant="h2">NOTHING HERE</Typography>
      <Typography>
        We couldn't find that page. Want to go <Link to="/">home</Link>?
      </Typography>
    </div>
  );
}

export default NotFound;
