import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

function NotFound() {
  return (
    <div>
      <Typography variant="h2">NOTHING HERE</Typography>
      <Typography>
        We could not find that page. Want to go <Link href="/">home</Link>?
      </Typography>
    </div>
  );
}

export default NotFound;
