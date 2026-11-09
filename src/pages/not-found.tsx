import { Link } from 'react-router';

function NotFound() {
  return (
    <div>
      <h2>NOTHING HERE</h2>
      <p>
        We couldn't find that page. Want to go <Link to="/">home</Link>?
      </p>
    </div>
  );
}

export default NotFound;
