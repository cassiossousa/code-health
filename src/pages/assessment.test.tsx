import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { theme } from '../design/theme';
import Assessment from './assessment';

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderAssessment() {
  return render(
    <ThemeProvider theme={theme}>
      <Assessment />
    </ThemeProvider>,
  );
}

describe('Assessment folder selection', () => {
  it('opens the local folder picker and shows the selected folder name', async () => {
    const user = userEvent.setup();
    const picker = vi.fn().mockResolvedValue({ name: 'my-project' });
    vi.stubGlobal('showDirectoryPicker', picker);
    renderAssessment();

    await user.click(
      screen.getByRole('button', { name: 'Select project folder' }),
    );

    expect(picker).toHaveBeenCalledOnce();
    expect(await screen.findByText('my-project')).toBeInTheDocument();
    expect(
      screen.getByText('No file is sent to our servers.'),
    ).toBeInTheDocument();
  });

  it('explains when folder selection is unavailable', async () => {
    const user = userEvent.setup();
    renderAssessment();

    await user.click(
      screen.getByRole('button', { name: 'Select project folder' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Folder selection is not supported by this browser.',
    );
  });
});
