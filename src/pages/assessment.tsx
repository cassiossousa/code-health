import { useState } from 'react';
import { Alert, Chip, Grid, SvgIcon, Card } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type FolderPickerWindow = Window & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

function Assessment() {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectFolder = async () => {
    const picker = (window as FolderPickerWindow).showDirectoryPicker;
    if (!picker) {
      setError('Folder selection is not supported by this browser.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const folder = await picker();
      setFolderName(folder.name);
    } catch (selectionError) {
      if (
        selectionError instanceof DOMException &&
        selectionError.name === 'AbortError'
      ) {
        return;
      }
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : 'The selected folder could not be opened.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Grid
        container
        spacing={1}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'start',
        }}
      >
        <Typography variant="h2">Repository Maintenance Assessment</Typography>
        <Chip color="success" label="Local analysis" />
      </Grid>

      <Typography variant="h6">
        Find the files that deserve a closer look.
      </Typography>

      <Typography>
        Select a project folder. Repo Health will inspect its JavaScript and
        TypeScript files locally.
      </Typography>

      <Card>
        <CardActionArea
          onClick={selectFolder}
          disabled={loading}
          aria-label="Select project folder"
          sx={{ p: 3 }}
        >
          <Stack sx={{ gap: 1, alignItems: 'center' }}>
            <SvgIcon color="success" fontSize="large" aria-hidden="true">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h12l6-8V8c0-1.1-.9-2-2-2Zm-.8 2-4.5 6H4V6h5.17l2 2h8.03ZM4 16h11.25l-1.5 2H4v-2Z" />
            </SvgIcon>

            <Typography sx={{ fontWeight: 'bold' }}>
              {loading
                ? 'Opening folder…'
                : folderName || 'Select project folder'}
            </Typography>

            <Typography variant="body2">
              No file is sent to our servers.
            </Typography>
          </Stack>
        </CardActionArea>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}

export default Assessment;
