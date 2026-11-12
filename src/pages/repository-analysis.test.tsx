import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { theme } from '../design/theme';
import { readLocalGitHistory } from './git-history';
import RepositoryAnalysis from './repository-analysis';

type Entry = DirectoryHandle | FileHandle;

interface FileHandle {
  kind: 'file';
  data: Uint8Array;
  getFile: () => Promise<Blob>;
}

interface DirectoryHandle {
  kind: 'directory';
  name: string;
  children: Map<string, Entry>;
  getFileHandle: (name: string) => Promise<FileHandle>;
  getDirectoryHandle: (name: string) => Promise<DirectoryHandle>;
  entries: () => AsyncIterableIterator<[string, Entry]>;
}

function missingEntry() {
  return new DOMException('Entry not found', 'NotFoundError');
}

function makeDirectory(name = 'directory'): DirectoryHandle {
  const children = new Map<string, Entry>();
  return {
    kind: 'directory',
    name,
    children,
    async getFileHandle(name) {
      const entry = children.get(name);
      if (!entry) throw missingEntry();
      if (entry.kind !== 'file') {
        throw new DOMException('Entry is a directory', 'TypeMismatchError');
      }
      return entry;
    },
    async getDirectoryHandle(name) {
      const entry = children.get(name);
      if (!entry) throw missingEntry();
      if (entry.kind !== 'directory') {
        throw new DOMException('Entry is a file', 'TypeMismatchError');
      }
      return entry;
    },
    async *entries() {
      yield* children.entries();
    },
  };
}

function addFile(root: DirectoryHandle, path: string, data: Uint8Array) {
  const parts = path.split('/');
  const name = parts.pop();
  if (!name) throw new Error('Invalid test path');
  let directory = root;
  for (const part of parts) {
    let child = directory.children.get(part);
    if (!child) {
      child = makeDirectory(part);
      directory.children.set(part, child);
    }
    if (child.kind !== 'directory')
      throw new Error(`${part} is not a directory`);
    directory = child;
  }
  directory.children.set(name, {
    kind: 'file',
    data,
    async getFile() {
      const buffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(buffer).set(data);
      return new Blob([buffer]);
    },
  });
}

function makeRepository() {
  const repository = makeDirectory();
  addFile(
    repository,
    '.git/HEAD',
    new TextEncoder().encode('ref: refs/heads/main\n'),
  );
  addFile(repository, '.git/objects/pack/.keep', new Uint8Array());

  const fixtures = [
    [
      '3c92e90fac70633dace2598ed4b18abad8a437fd',
      'eJxLzs/NzSxRMDQzZSgpSk1VMCAScCWWlmTkFymEpBaXKIQWpxYp2JSkFpc4pFYk5hbkpOol5+faKRiaQ1UbKmiDNSWDbStJJVUflzPUmVwAlcsw9Q==',
    ],
    [
      '0de3436401641acf6e5937fb3ddf27897d99c21d',
      'eJyVj0sKAjEQRF3nFL0XJJ/RJCAieAU9QE9Sg4IxQ9KCxxeGOYDWvl69SrWUh5A1biMNIP1j1MwNLyGXokXUEyevD85lTrD7GJCH0QQeOQcenJ+y4rfca6MrutCto9FR0OWMD5f5iV2q5UTGr3RL22UkLXaCf3vqst5SXw+cP1g=',
    ],
    [
      'c99edd3ad5be282d7dca3ef54b3bc34edfa32538',
      'eJyVj1EKQiEQRft2FfMfhDqmCRFBW6gF2DhSkM+HTtDyg1cLqPt/zz2XWq13AWtwJZ0Z9I9Rc+o8CejM6NA7bbwziYrnbcRQrphzsWEXQ46RrMkqPeXWOpx5CFwGd9gLDznyK9X5wRtq9QAmfOkI62WEFjvhf3vq9LmF6g2Ufj55',
    ],
    [
      '7c76c94ac455c7301cdd6393862d2c9990eca4df',
      'eJyVj1EKwjAQRP3OKfZfEJtNaAtSBK+gB0g2UxSMKckKHl+oHkDnf968kZLzTcl2vNEK0P7HmCVUPJRkHJESh+Qj7GBTnyQwZu8iR2GHNAe2ngcTnnotlc5oSpeGSgdF0yNeIS937KTkibr+S3e0XUdktVP82zOnzy1n3lLDP74=',
    ],
    [
      '33e6eb251a9b7ca9fad7d8cccc6f289367c29436',
      'eJyVj0sKAjEQRF3nFL0fkPxjQESYK+gBmk6LgjFD0oLHF0YPoLWvV6+o1XoTsMZtpDOD/jFqwc4PgUQpUvZIPgRKThsqJbrsdtEWSzlnzYS+XBQ+5do6nHgInAd32AsPOfIL63LnLbV6AJO+9ADTOkKrnfC/PTV/bgX1Bq/5PrE=',
    ],
  ] as const;
  for (const [hash, base64] of fixtures) {
    const compressed = Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0),
    );
    addFile(
      repository,
      `.git/objects/${hash.slice(0, 2)}/${hash.slice(2)}`,
      compressed,
    );
  }
  const head = fixtures[fixtures.length - 1][0];
  addFile(
    repository,
    '.git/refs/heads/main',
    new TextEncoder().encode(`${head}\n`),
  );
  return {
    repository,
    head,
    expectedSubjects: fixtures.map((_, index) => `Commit ${index + 1}`),
  };
}

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <RepositoryAnalysis />
    </ThemeProvider>,
  );
}

function makePackIndex(hash: string) {
  const index = new Uint8Array(1100);
  const view = new DataView(index.buffer);
  view.setUint32(0, 0xff744f63);
  view.setUint32(4, 2);
  const firstByte = Number.parseInt(hash.slice(0, 2), 16);
  for (let bucket = 0; bucket < 256; bucket += 1) {
    view.setUint32(8 + bucket * 4, bucket < firstByte ? 0 : 1);
  }
  for (let byte = 0; byte < 20; byte += 1) {
    index.set(
      [Number.parseInt(hash.slice(byte * 2, byte * 2 + 2), 16)],
      1032 + byte,
    );
  }
  view.setUint32(1056, 12);
  return index;
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalBlobStream) {
    Object.defineProperty(Blob.prototype, 'stream', {
      value: originalBlobStream,
    });
  } else {
    Reflect.deleteProperty(Blob.prototype, 'stream');
  }
});

const originalBlobStream = Blob.prototype.stream;
beforeEach(() => {
  if (!Blob.prototype.stream) {
    Object.defineProperty(Blob.prototype, 'stream', {
      configurable: true,
      value(this: Blob) {
        const arrayBuffer = this.arrayBuffer.bind(this);
        return new ReadableStream<Uint8Array>({
          start(controller) {
            void arrayBuffer().then((buffer) => {
              controller.enqueue(new Uint8Array(buffer));
              controller.close();
            });
          },
        });
      },
    });
  }
});

describe('RepositoryAnalysis', () => {
  it('shows the illustrative assessment and reveals selected file measurements', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      screen.getByText('Illustrative results, not an actual repository scan'),
    ).toBeInTheDocument();
    expect(screen.getByText('Attention candidates')).toBeInTheDocument();
    expect(screen.getByText('428')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'auth.ts' }));
    expect(
      screen.getByRole('heading', { name: 'Measurements for auth.ts' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('39 changes · 268 lines · 7 dependencies'),
    ).toBeInTheDocument();
    expect(screen.getByText('High structural complexity')).toBeInTheDocument();
  });

  it('reads HEAD and the latest five commit records from the selected local checkout', async () => {
    const user = userEvent.setup();
    const { repository, head, expectedSubjects } = makeRepository();
    const picker = vi.fn().mockResolvedValue(repository);
    const fetchSpy = vi.fn();
    vi.stubGlobal('showDirectoryPicker', picker);
    vi.stubGlobal('fetch', fetchSpy);
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Choose repository' }));

    expect(
      await screen.findByText('Local history: directory'),
    ).toBeInTheDocument();
    expect(screen.getByText(head)).toBeInTheDocument();
    const commitList = screen.getByRole('list', { name: 'Last five commits' });
    expect(within(commitList).getAllByRole('listitem')).toHaveLength(5);
    expect(
      within(commitList)
        .getAllByRole('listitem')
        .map((item) => item.querySelector('strong')?.textContent),
    ).toEqual([...expectedSubjects].reverse());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reads commits from a local packed Git object database', async () => {
    const repository = makeDirectory();
    const hash = '05735b8540630cc306d651e8705873f139fbaf3d';
    const pack = Uint8Array.from(
      atob(
        'UEFDSwAAAAIAAAABmgt4nCspSk1VMCAScCWWlmTkFykEJCZnp6YohBanFinYFIA5DqkVibkFOal6yfm5dgqG5hANhgYK2mCNyfm5uZklJank6OWCaknLrCgpLUpVgJjFBQCR9DWuRoE/MgwmIOjGHv582WWSBdtvIkw=',
      ),
      (character) => character.charCodeAt(0),
    );
    addFile(
      repository,
      '.git/HEAD',
      new TextEncoder().encode('ref: refs/heads/main\n'),
    );
    addFile(
      repository,
      '.git/packed-refs',
      new TextEncoder().encode(`${hash} refs/heads/main\n`),
    );
    addFile(repository, '.git/objects/pack/pack-test.pack', pack);
    addFile(repository, '.git/objects/pack/pack-test.idx', makePackIndex(hash));

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).resolves.toMatchObject({
      head: hash,
      commits: [
        { hash, subject: 'Packed fixture commit', author: 'Packed User' },
      ],
    });
  });

  it('reports when the selected directory is not a Git checkout', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'showDirectoryPicker',
      vi.fn().mockResolvedValue(makeDirectory()),
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Choose repository' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The selected directory does not contain a Git checkout.',
    );
  });
});
