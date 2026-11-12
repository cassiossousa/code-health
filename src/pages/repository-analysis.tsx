import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { readLocalGitHistory, type GitCommit } from './git-history';

const sampleFiles = [
  {
    name: 'billing.ts',
    activity: 'High',
    burden: 'High',
    measurements: '46 changes · 312 lines · 8 dependencies',
    findings: ['Frequently changed with several structural warnings.'],
    reasons: ['Repeated edits in the examined period', 'High dependency count'],
  },
  {
    name: 'auth.ts',
    activity: 'High',
    burden: 'High',
    measurements: '39 changes · 268 lines · 7 dependencies',
    findings: ['A large, frequently modified module with concentrated logic.'],
    reasons: [
      'Repeated edits in the examined period',
      'High structural complexity',
    ],
  },
  {
    name: 'orders.ts',
    activity: 'High',
    burden: 'Medium',
    measurements: '33 changes · 214 lines · 5 dependencies',
    findings: ['Change activity is high; structural burden is moderate.'],
    reasons: [
      'Repeated edits in the examined period',
      'Moderate dependency count',
    ],
  },
  {
    name: 'reports.ts',
    activity: 'Medium',
    burden: 'High',
    measurements: '18 changes · 391 lines · 9 dependencies',
    findings: ['The module has substantial structural burden.'],
    reasons: ['High dependency count', 'Large module size'],
  },
] as const;

type PickerWindow = Window & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

interface LocalRepository {
  name: string;
  head: string;
  commits: GitCommit[];
}

function RepositoryAnalysis() {
  const [selectedFile, setSelectedFile] = useState<string>(sampleFiles[0].name);
  const [repository, setRepository] = useState<LocalRepository | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedDetails = sampleFiles.find(
    (file) => file.name === selectedFile,
  );

  const selectRepository = async () => {
    const picker = (window as PickerWindow).showDirectoryPicker;
    if (!picker) {
      setError(
        'Local repository selection is not supported by this browser. Try a current Chromium-based browser.',
      );
      return;
    }

    setError('');
    setLoading(true);
    try {
      const directory = await picker();
      const history = await readLocalGitHistory(directory);
      setRepository({ name: directory.name, ...history });
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
          : 'The selected repository could not be read.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={{ display: 'grid', gap: 3 }}>
      <Box component="header">
        <Typography
          variant="overline"
          color="primary"
          sx={{ display: 'block', fontWeight: 'bold' }}
        >
          Repository maintenance assessment
        </Typography>
        <Typography
          variant="h2"
          sx={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', mb: 1 }}
        >
          Understand what deserves attention
        </Typography>
        <Typography sx={{ maxWidth: '62ch' }}>
          Review change activity and structural burden, then inspect the local
          Git history. Repository files stay on your device.
        </Typography>
      </Box>

      <Paper
        component="section"
        variant="outlined"
        aria-labelledby="local-repository-heading"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h3" id="local-repository-heading" gutterBottom>
              Select a local Git repository
            </Typography>
            <Typography>
              Choose a directory containing a standard Git checkout.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={selectRepository}
            disabled={loading}
          >
            {loading ? 'Reading repository…' : 'Choose repository'}
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexBasis: '100%' }}
          >
            No source-code upload. The browser reads local Git metadata only;
            repository data is not sent over the network.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ flexBasis: '100%' }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>

      {repository && (
        <Paper
          component="section"
          variant="outlined"
          aria-labelledby="history-heading"
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          <Typography variant="h3" id="history-heading" gutterBottom>
            Local history: {repository.name}
          </Typography>
          <Typography>
            HEAD <code>{repository.head}</code>
          </Typography>
          <List
            component="ol"
            aria-label="Last five commits"
            sx={{ display: 'grid', gap: 1, pl: 3 }}
          >
            {repository.commits.map((commit) => (
              <ListItem key={commit.hash} component="li" disableGutters>
                <Box>
                  <Typography component="strong">{commit.subject}</Typography>
                  <Typography
                    component="p"
                    variant="body2"
                    color="text.secondary"
                  >
                    <code>{commit.hash.slice(0, 7)}</code> · {commit.author} ·{' '}
                    {new Date(commit.authoredAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Paper
        component="section"
        variant="outlined"
        aria-labelledby="example-heading"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Typography
          variant="overline"
          color="primary"
          sx={{ display: 'block', fontWeight: 'bold' }}
        >
          Example assessment
        </Typography>
        <Typography variant="h3" id="example-heading" gutterBottom>
          Illustrative results, not an actual repository scan
        </Typography>

        <Box
          aria-label="Example assessment summary"
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            my: 2,
          }}
        >
          {[
            ['12', 'Attention candidates'],
            ['428', 'Source files'],
            ['90d', 'History examined'],
          ].map(([value, label]) => (
            <Box
              key={label}
              sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}
            >
              <Typography variant="h5">{value}</Typography>
              <Typography component="span" variant="body2">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="h3" gutterBottom>
          Files deserving investigation
        </Typography>
        <TableContainer>
          <Table
            aria-label="Files deserving investigation"
            sx={{ minWidth: 520 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Change activity</TableCell>
                <TableCell>Structural burden</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleFiles.map((file) => (
                <TableRow key={file.name}>
                  <TableCell>
                    <Button
                      size="small"
                      aria-pressed={selectedFile === file.name}
                      onClick={() => setSelectedFile(file.name)}
                      sx={{
                        minWidth: 0,
                        p: 0,
                        textTransform: 'none',
                        textDecoration:
                          selectedFile === file.name ? 'underline' : 'none',
                      }}
                    >
                      <code>{file.name}</code>
                    </Button>
                  </TableCell>
                  <TableCell>{file.activity}</TableCell>
                  <TableCell>{file.burden}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedDetails && (
          <Box
            component="section"
            aria-live="polite"
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              mt: 2,
            }}
          >
            <Typography variant="h3" sx={{ gridColumn: '1 / -1' }}>
              Measurements for <code>{selectedDetails.name}</code>
            </Typography>
            <Box>
              <Typography component="dt" variant="body2" color="text.secondary">
                Measurements
              </Typography>
              <Typography component="dd" sx={{ m: 0 }}>
                {selectedDetails.measurements}
              </Typography>
            </Box>
            <Box>
              <Typography component="dt" variant="body2" color="text.secondary">
                Contributing findings
              </Typography>
              <List
                component="ul"
                dense
                sx={{ listStyle: 'disc', pl: 2, py: 0 }}
              >
                {selectedDetails.findings.map((finding) => (
                  <ListItem
                    key={finding}
                    component="li"
                    sx={{ display: 'list-item', p: 0 }}
                  >
                    {finding}
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Typography component="dt" variant="body2" color="text.secondary">
                Reasons for inclusion
              </Typography>
              <List
                component="ul"
                dense
                sx={{ listStyle: 'disc', pl: 2, py: 0 }}
              >
                {selectedDetails.reasons.map((reason) => (
                  <ListItem
                    key={reason}
                    component="li"
                    sx={{ display: 'list-item', p: 0 }}
                  >
                    {reason}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default RepositoryAnalysis;
