import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

function Home() {
  return (
    <Stack spacing={2}>
      <Typography variant="h2">HELLO</Typography>
      <Typography>
        Cras facilisis urna ornare ex volutpat, et convallis erat elementum. Ut
        aliquam, ipsum vitae gravida suscipit, metus dui bibendum est, eget
        rhoncus nibh metus nec massa. Maecenas hendrerit laoreet augue nec
        molestie. Cum sociis natoque penatibus et magnis dis parturient montes,
        nascetur ridiculus mus.
      </Typography>
      <Typography>
        Duis a turpis sed lacus dapibus elementum sed eu lectus.
      </Typography>
    </Stack>
  );
}

export default Home;
