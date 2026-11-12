import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readLocalGitHistory } from './git-history';

type TestEntry = TestDirectory | TestFile;

interface TestFile {
  kind: 'file';
  bytes: Uint8Array;
  getFile: () => Promise<Blob>;
}

interface TestDirectory {
  kind: 'directory';
  children: Map<string, TestEntry>;
  getFileHandle: (name: string) => Promise<TestFile>;
  getDirectoryHandle: (name: string) => Promise<TestDirectory>;
  entries: () => AsyncIterableIterator<[string, TestEntry]>;
}

const commitHash = 'a'.repeat(40);
const tagHash = 'b'.repeat(40);
const commitObject =
  'eJxLzs/NzSxRMDQzZSgpSk1VMCAScCWWlmTkFymEpBaXKIQWpxYp2JSkFpc4pFYk5hbkpOol5+faKRiaQ1UbKmiDNSWDbStJJVUflzPUmVwAlcsw9Q==';
const tagObject =
  'eJyNxUEKgzAQBVDXc4q/F0rSjQil9BB6gDF8gsWQkAxiby96gr7NM43wz7HLy5fBoH8S+xUi5JRWE9OI3V9FVkxshrmx4mVs9uGhqWx8hJze8IO7eYf+WqRyozbKCdDeLUM=';

function bytesFromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function missingEntry(): DOMException {
  return new DOMException('Entry not found', 'NotFoundError');
}

function makeFile(bytes: Uint8Array): TestFile {
  return {
    kind: 'file',
    bytes,
    async getFile() {
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      return new Blob([buffer]);
    },
  };
}

function makeDirectory(): TestDirectory {
  const children = new Map<string, TestEntry>();
  return {
    kind: 'directory',
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

function addFile(root: TestDirectory, path: string, bytes: Uint8Array): void {
  const parts = path.split('/');
  const fileName = parts.pop();
  if (!fileName) throw new Error('Invalid test path');

  let directory = root;
  for (const part of parts) {
    let child = directory.children.get(part);
    if (!child) {
      child = makeDirectory();
      directory.children.set(part, child);
    }
    if (child.kind !== 'directory') {
      throw new Error(`${part} is not a directory`);
    }
    directory = child;
  }
  directory.children.set(fileName, makeFile(bytes));
}

function makeLooseCommitRepository(): TestDirectory {
  const repository = makeDirectory();
  addFile(repository, '.git/HEAD', new TextEncoder().encode(`${commitHash}\n`));
  addFile(
    repository,
    `.git/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
    bytesFromBase64(commitObject),
  );
  return repository;
}

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

afterEach(() => {
  if (originalBlobStream) {
    Object.defineProperty(Blob.prototype, 'stream', {
      value: originalBlobStream,
    });
  } else {
    Reflect.deleteProperty(Blob.prototype, 'stream');
  }
});

describe('readLocalGitHistory', () => {
  it('reads a detached HEAD commit from a loose object', async () => {
    await expect(
      readLocalGitHistory(
        makeLooseCommitRepository() as unknown as FileSystemDirectoryHandle,
      ),
    ).resolves.toEqual({
      head: commitHash,
      commits: [
        {
          hash: commitHash,
          subject: 'Commit 1',
          author: 'Test User',
          authoredAt: '2023-11-14T22:13:21.000Z',
        },
      ],
    });
  });

  it('resolves a symbolic HEAD from packed refs and peels an annotated tag', async () => {
    const repository = makeDirectory();
    addFile(
      repository,
      '.git/HEAD',
      new TextEncoder().encode('ref: refs/tags/v1\n'),
    );
    addFile(
      repository,
      '.git/packed-refs',
      new TextEncoder().encode(
        `# pack-refs with: peeled fully-peeled\n${tagHash} refs/tags/v1\n^${commitHash}\n`,
      ),
    );
    addFile(
      repository,
      `.git/objects/${tagHash.slice(0, 2)}/${tagHash.slice(2)}`,
      bytesFromBase64(tagObject),
    );
    addFile(
      repository,
      `.git/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
      bytesFromBase64(commitObject),
    );

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).resolves.toMatchObject({
      head: tagHash,
      commits: [{ hash: commitHash, subject: 'Commit 1' }],
    });
  });

  it('rejects a directory without a Git checkout', async () => {
    await expect(
      readLocalGitHistory(
        makeDirectory() as unknown as FileSystemDirectoryHandle,
      ),
    ).rejects.toThrow(
      'The selected directory does not contain a Git checkout.',
    );
  });

  it('rejects a linked worktree whose .git entry is a file', async () => {
    const repository = makeDirectory();
    repository.children.set(
      '.git',
      makeFile(new TextEncoder().encode('gitdir: ../.git/worktrees/example')),
    );

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).rejects.toThrow('This checkout uses a linked worktree.');
  });

  it.each([
    ['', 'The selected Git checkout has no HEAD reference.'],
    ['not-a-sha', 'The checkout HEAD is not a supported SHA-1 commit.'],
  ])('rejects invalid HEAD content: %s', async (head, expectedError) => {
    const repository = makeDirectory();
    addFile(repository, '.git/HEAD', new TextEncoder().encode(head));

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).rejects.toThrow(expectedError);
  });

  it('reports a valid but missing local Git object', async () => {
    const repository = makeDirectory();
    addFile(
      repository,
      '.git/HEAD',
      new TextEncoder().encode(`${commitHash}\n`),
    );

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).rejects.toThrow(`Git object ${commitHash} was not found locally.`);
  });

  it('rejects a HEAD object that is not a commit', async () => {
    const repository = makeDirectory();
    addFile(
      repository,
      '.git/HEAD',
      new TextEncoder().encode(`${commitHash}\n`),
    );
    addFile(
      repository,
      `.git/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
      bytesFromBase64('eJxLyslPUjBgAAAJsAHw'),
    );

    await expect(
      readLocalGitHistory(repository as unknown as FileSystemDirectoryHandle),
    ).rejects.toThrow('The selected HEAD does not refer to a commit.');
  });
});
