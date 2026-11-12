import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink, Outlet } from 'react-router';
import { ROUTES } from '../routes';

interface PageProps {
  title?: string;
}

function Layout({ title = 'Code Health' }: PageProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h1">{title}</Typography>
      <AppBar position="static" component="nav" aria-label="Main navigation">
        <Toolbar>
          {ROUTES.map(({ to, label }) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              color="inherit"
              sx={{
                '&[aria-current="page"]': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Card sx={{ p: 3 }}>
        <Outlet />
      </Card>
    </Stack>
  );
}

export default Layout;
