type GitObjectType = 'commit' | 'tree' | 'blob' | 'tag';

interface GitObject {
  type: GitObjectType;
  data: Uint8Array;
}

interface PackEntry {
  packName: string;
  offset: number;
}

interface PackIndex {
  objects: Map<string, number>;
}

const decoder = new TextDecoder();

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError';
}

async function readFile(
  directory: FileSystemDirectoryHandle,
  name: string,
): Promise<Uint8Array | undefined> {
  try {
    const handle = await directory.getFileHandle(name);
    return new Uint8Array(await (await handle.getFile()).arrayBuffer());
  } catch (error) {
    if (isNotFound(error)) return undefined;
    throw error;
  }
}

async function readText(
  directory: FileSystemDirectoryHandle,
  path: string,
): Promise<string | undefined> {
  const parts = path.split('/');
  const fileName = parts.pop();
  if (!fileName) return undefined;

  let current = directory;
  for (const part of parts) {
    try {
      current = await current.getDirectoryHandle(part);
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  }

  const bytes = await readFile(current, fileName);
  return bytes ? decoder.decode(bytes) : undefined;
}

async function readBytesAtPath(
  directory: FileSystemDirectoryHandle,
  path: string,
): Promise<Uint8Array | undefined> {
  const parts = path.split('/');
  const fileName = parts.pop();
  if (!fileName) return undefined;

  let current = directory;
  for (const part of parts) {
    try {
      current = await current.getDirectoryHandle(part);
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  }
  return readFile(current, fileName);
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'This browser does not support local Git object decompression.',
    );
  }
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parseGitObject(bytes: Uint8Array): GitObject {
  const separator = bytes.indexOf(0);
  if (separator < 0) throw new Error('A Git object has an invalid header.');
  const header = decoder.decode(bytes.subarray(0, separator));
  const match = /^(commit|tree|blob|tag) (\d+)$/.exec(header);
  if (!match) throw new Error('A Git object has an unsupported type.');
  const data = bytes.subarray(separator + 1);
  if (data.length !== Number(match[2])) {
    throw new Error('A Git object has an invalid content length.');
  }
  return { type: match[1] as GitObjectType, data };
}

function parsePackIndex(bytes: Uint8Array): PackIndex {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 8 + 256 * 4 + 40 || view.getUint32(0) !== 0xff744f63) {
    throw new Error(
      'A Git pack index is invalid or uses an unsupported format.',
    );
  }
  if (view.getUint32(4) !== 2) {
    throw new Error('Only version 2 Git pack indexes are supported.');
  }

  const count = view.getUint32(8 + 255 * 4);
  const namesStart = 8 + 256 * 4;
  const offsetsStart = namesStart + count * 20 + count * 4;
  const largeOffsetsStart = offsetsStart + count * 4;
  if (largeOffsetsStart > bytes.length - 40) {
    throw new Error('A Git pack index has an invalid length.');
  }

  const objects = new Map<string, number>();
  for (let index = 0; index < count; index += 1) {
    const hashStart = namesStart + index * 20;
    const hash = Array.from(bytes.subarray(hashStart, hashStart + 20))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
    const offsetValue = view.getUint32(offsetsStart + index * 4);
    const offset =
      offsetValue & 0x80000000
        ? Number(
            view.getBigUint64(
              largeOffsetsStart + (offsetValue & 0x7fffffff) * 8,
            ),
          )
        : offsetValue;
    objects.set(hash, offset);
  }
  return { objects };
}

class BitReader {
  private bitOffset = 16;
  private readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  read(count: number): number {
    let value = 0;
    for (let bit = 0; bit < count; bit += 1) {
      const byte = this.bytes[this.bitOffset >> 3];
      if (byte === undefined)
        throw new Error('A packed Git object is truncated.');
      value |= ((byte >> (this.bitOffset & 7)) & 1) << bit;
      this.bitOffset += 1;
    }
    return value;
  }

  readSymbol(table: Map<number, number>[]): number {
    let code = 0;
    for (let length = 1; length < table.length; length += 1) {
      code = (code << 1) | this.read(1);
      const symbol = table[length].get(code);
      if (symbol !== undefined) return symbol;
    }
    throw new Error('A packed Git object has an invalid deflate code.');
  }

  alignToByte(): void {
    this.bitOffset = (this.bitOffset + 7) & ~7;
  }

  get byteOffset(): number {
    return this.bitOffset >> 3;
  }
}

function makeHuffmanTable(lengths: number[]): Map<number, number>[] {
  const counts = new Array<number>(16).fill(0);
  lengths.forEach((length) => {
    if (length > 15)
      throw new Error('A packed Git object has an invalid code length.');
    if (length > 0) counts[length] += 1;
  });
  const nextCode = new Array<number>(16).fill(0);
  let code = 0;
  for (let length = 1; length <= 15; length += 1) {
    code = (code + counts[length - 1]) << 1;
    nextCode[length] = code;
  }

  const table = Array.from({ length: 16 }, () => new Map<number, number>());
  lengths.forEach((length, symbol) => {
    if (!length) return;
    table[length].set(nextCode[length]++, symbol);
  });
  return table;
}

function compressedLength(bytes: Uint8Array): number {
  if (bytes.length < 6 || (bytes[0] & 0x0f) !== 8) {
    throw new Error('A packed Git object has an invalid zlib header.');
  }
  const reader = new BitReader(bytes);
  let finalBlock = false;
  while (!finalBlock) {
    finalBlock = reader.read(1) === 1;
    const blockType = reader.read(2);
    if (blockType === 0) {
      reader.alignToByte();
      const length = reader.read(16);
      const inverseLength = reader.read(16);
      if ((length ^ 0xffff) !== inverseLength) {
        throw new Error('A packed Git object has an invalid deflate block.');
      }
      for (let byte = 0; byte < length; byte += 1) reader.read(8);
      continue;
    }
    if (blockType === 3)
      throw new Error('A packed Git object has a reserved deflate block.');

    let literalTable: Map<number, number>[];
    let distanceTable: Map<number, number>[];
    if (blockType === 1) {
      literalTable = makeHuffmanTable([
        ...new Array<number>(144).fill(8),
        ...new Array<number>(112).fill(9),
        ...new Array<number>(24).fill(7),
        ...new Array<number>(8).fill(8),
      ]);
      distanceTable = makeHuffmanTable(new Array<number>(32).fill(5));
    } else {
      const literalCount = reader.read(5) + 257;
      const distanceCount = reader.read(5) + 1;
      const codeLengthCount = reader.read(4) + 4;
      const order = [
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
      ];
      const codeLengths = new Array<number>(19).fill(0);
      for (let index = 0; index < codeLengthCount; index += 1) {
        codeLengths[order[index]] = reader.read(3);
      }
      const codeLengthTable = makeHuffmanTable(codeLengths);
      const lengths: number[] = [];
      while (lengths.length < literalCount + distanceCount) {
        const symbol = reader.readSymbol(codeLengthTable);
        if (symbol < 16) {
          lengths.push(symbol);
        } else if (symbol === 16) {
          const previous = lengths[lengths.length - 1];
          if (previous === undefined)
            throw new Error('A deflate code length is invalid.');
          lengths.push(...new Array<number>(reader.read(2) + 3).fill(previous));
        } else if (symbol === 17) {
          lengths.push(...new Array<number>(reader.read(3) + 3).fill(0));
        } else {
          lengths.push(...new Array<number>(reader.read(7) + 11).fill(0));
        }
      }
      literalTable = makeHuffmanTable(lengths.slice(0, literalCount));
      distanceTable = makeHuffmanTable(lengths.slice(literalCount));
    }

    while (true) {
      const symbol = reader.readSymbol(literalTable);
      if (symbol < 256) continue;
      if (symbol === 256) break;
      if (symbol > 285)
        throw new Error('A packed Git object has an invalid length code.');
      const lengthExtra = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
        5, 5, 5, 5, 0,
      ];
      const distanceExtra = [
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
        10, 11, 11, 12, 12, 13, 13,
      ];
      reader.read(lengthExtra[symbol - 257]);
      const distanceSymbol = reader.readSymbol(distanceTable);
      if (distanceSymbol > 29)
        throw new Error('A packed Git object has an invalid distance code.');
      reader.read(distanceExtra[distanceSymbol]);
    }
  }
  reader.alignToByte();
  return reader.byteOffset + 4;
}

function applyDelta(base: Uint8Array, delta: Uint8Array): Uint8Array {
  let cursor = 0;
  const readVarint = (): number => {
    let value = 0;
    let shift = 0;
    while (true) {
      const byte = delta[cursor++];
      if (byte === undefined || shift > 28)
        throw new Error('A Git delta is invalid.');
      value |= (byte & 0x7f) << shift;
      if (!(byte & 0x80)) return value;
      shift += 7;
    }
  };
  const baseSize = readVarint();
  const resultSize = readVarint();
  if (baseSize !== base.length)
    throw new Error('A Git delta base has an invalid size.');
  const result = new Uint8Array(resultSize);
  let outputOffset = 0;
  while (cursor < delta.length) {
    const command = delta[cursor++];
    if (command === undefined || command === 0)
      throw new Error('A Git delta command is invalid.');
    if (command & 0x80) {
      let copyOffset = 0;
      let copySize = 0;
      for (let bit = 0; bit < 4; bit += 1) {
        if (command & (1 << bit)) copyOffset |= delta[cursor++] << (bit * 8);
      }
      for (let bit = 0; bit < 3; bit += 1) {
        if (command & (1 << (bit + 4)))
          copySize |= delta[cursor++] << (bit * 8);
      }
      if (!copySize) copySize = 0x10000;
      if (
        copyOffset + copySize > base.length ||
        outputOffset + copySize > result.length
      ) {
        throw new Error('A Git delta copy exceeds its object bounds.');
      }
      result.set(
        base.subarray(copyOffset, copyOffset + copySize),
        outputOffset,
      );
      outputOffset += copySize;
    } else {
      if (
        outputOffset + command > result.length ||
        cursor + command > delta.length
      ) {
        throw new Error('A Git delta insert exceeds its object bounds.');
      }
      result.set(delta.subarray(cursor, cursor + command), outputOffset);
      cursor += command;
      outputOffset += command;
    }
  }
  if (outputOffset !== result.length)
    throw new Error('A Git delta has an invalid result size.');
  return result;
}

const typeNames: Record<number, GitObjectType | 'ofs-delta' | 'ref-delta'> = {
  1: 'commit',
  2: 'tree',
  3: 'blob',
  4: 'tag',
  6: 'ofs-delta',
  7: 'ref-delta',
};

function parsePackObjectHeader(bytes: Uint8Array, start: number) {
  let cursor = start;
  let byte = bytes[cursor++];
  if (byte === undefined) throw new Error('A Git pack object is truncated.');
  const type = typeNames[(byte >> 4) & 7];
  if (!type) throw new Error('A Git pack object has an invalid type.');
  let size = byte & 15;
  let shift = 4;
  while (byte & 0x80) {
    byte = bytes[cursor++];
    if (byte === undefined || shift > 28)
      throw new Error('A Git pack object header is invalid.');
    size |= (byte & 0x7f) << shift;
    shift += 7;
  }

  let baseOffset: number | undefined;
  let baseHash: string | undefined;
  if (type === 'ofs-delta') {
    byte = bytes[cursor++];
    if (byte === undefined) throw new Error('A Git offset delta is truncated.');
    let distance = byte & 0x7f;
    while (byte & 0x80) {
      byte = bytes[cursor++];
      if (byte === undefined)
        throw new Error('A Git offset delta is truncated.');
      distance = ((distance + 1) << 7) | (byte & 0x7f);
    }
    baseOffset = start - distance;
  } else if (type === 'ref-delta') {
    baseHash = Array.from(bytes.subarray(cursor, cursor + 20))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
    if (baseHash.length !== 40)
      throw new Error('A Git reference delta is truncated.');
    cursor += 20;
  }
  return { type, size, cursor, baseOffset, baseHash };
}

function parseCommit(object: GitObject, hash: string): GitCommit {
  if (object.type !== 'commit')
    throw new Error('The selected HEAD does not refer to a commit.');
  const text = decoder.decode(object.data);
  const separator = text.indexOf('\n\n');
  if (separator < 0) throw new Error('A Git commit has an invalid format.');
  const headers = text.slice(0, separator).split('\n');
  const committer = headers.find((line) => line.startsWith('committer '));
  const author = headers.find((line) => line.startsWith('author '));
  const commitIdentity = (identity: string | undefined) => {
    const match = /^.+ <([^>]*)> (\d+) ([+-]\d{4})$/.exec(identity ?? '');
    return match ? { email: match[1], timestamp: Number(match[2]) } : undefined;
  };
  const committerInfo = commitIdentity(committer?.slice('committer '.length));
  const authorInfo = commitIdentity(author?.slice('author '.length));
  const subject =
    text
      .slice(separator + 2)
      .split(/\r?\n/)
      .find((line) => line.trim())
      ?.trim() || '(no commit message)';
  return {
    hash,
    subject,
    author:
      author?.slice('author '.length).replace(/ <.*$/, '') ?? 'Unknown author',
    authoredAt: new Date(
      (authorInfo?.timestamp ?? committerInfo?.timestamp ?? 0) * 1000,
    ).toISOString(),
    parent: headers.find((line) => line.startsWith('parent '))?.slice(7),
  };
}

export interface GitCommit {
  hash: string;
  subject: string;
  author: string;
  authoredAt: string;
  parent?: string;
}

export interface LocalGitHistory {
  head: string;
  commits: GitCommit[];
}

export async function readLocalGitHistory(
  repository: FileSystemDirectoryHandle,
): Promise<LocalGitHistory> {
  let gitDirectory: FileSystemDirectoryHandle;
  try {
    gitDirectory = await repository.getDirectoryHandle('.git');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TypeMismatchError') {
      throw new Error(
        'This checkout uses a linked worktree. Select a standard Git checkout instead.',
      );
    }
    if (isNotFound(error))
      throw new Error(
        'The selected directory does not contain a Git checkout.',
      );
    throw error;
  }

  const headText = (await readText(gitDirectory, 'HEAD'))?.trim();
  if (!headText)
    throw new Error('The selected Git checkout has no HEAD reference.');
  let head = headText;
  if (headText.startsWith('ref: ')) {
    const reference = headText.slice(5);
    head = (await readText(gitDirectory, reference))?.trim() ?? '';
    if (!head) {
      const packedRefs = await readText(gitDirectory, 'packed-refs');
      head =
        packedRefs
          ?.split(/\r?\n/)
          .find(
            (line) =>
              !line.startsWith('#') &&
              !line.startsWith('^') &&
              line.endsWith(` ${reference}`),
          )
          ?.split(' ')[0] ?? '';
    }
  }
  if (!/^[\da-f]{40}$/i.test(head))
    throw new Error('The checkout HEAD is not a supported SHA-1 commit.');

  const packDirectory = await gitDirectory
    .getDirectoryHandle('objects')
    .then((objects) => objects.getDirectoryHandle('pack'))
    .catch((error: unknown) => {
      if (isNotFound(error)) return undefined;
      throw error;
    });
  const packedObjects = new Map<string, PackEntry>();
  const packData = new Map<string, Uint8Array>();
  if (packDirectory) {
    const directoryWithEntries = packDirectory as FileSystemDirectoryHandle & {
      entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    };
    for await (const [name, handle] of directoryWithEntries.entries()) {
      if (handle.kind !== 'file' || !name.endsWith('.idx')) continue;
      const indexBytes = await readFile(packDirectory, name);
      if (!indexBytes) continue;
      const index = parsePackIndex(indexBytes);
      const packName = `${name.slice(0, -4)}.pack`;
      for (const [hash, offset] of index.objects)
        packedObjects.set(hash, { packName, offset });
    }
  }

  const resolving = new Set<string>();
  const loadObject = async (hash: string, depth = 0): Promise<GitObject> => {
    if (depth > 50 || resolving.has(hash))
      throw new Error('The Git object history contains a cycle.');
    resolving.add(hash);
    try {
      const looseBytes = await readBytesAtPath(
        gitDirectory,
        `objects/${hash.slice(0, 2)}/${hash.slice(2)}`,
      );
      if (looseBytes) return parseGitObject(await inflate(looseBytes));
      const entry = packedObjects.get(hash);
      if (!entry || !packDirectory)
        throw new Error(`Git object ${hash} was not found locally.`);
      let bytes = packData.get(entry.packName);
      if (!bytes) {
        bytes = await readFile(packDirectory, entry.packName);
        if (!bytes)
          throw new Error(`The local Git pack ${entry.packName} is missing.`);
        packData.set(entry.packName, bytes);
      }
      if (decoder.decode(bytes.subarray(0, 4)) !== 'PACK') {
        throw new Error('A local Git pack has an invalid header.');
      }
      const loadAtOffset = async (
        offset: number,
        objectDepth: number,
      ): Promise<GitObject> => {
        if (objectDepth > 50)
          throw new Error('The Git pack contains too many nested deltas.');
        const packHeader = parsePackObjectHeader(bytes!, offset);
        const compressedStart = packHeader.cursor;
        if (packHeader.baseOffset !== undefined) {
          const base = await loadAtOffset(
            packHeader.baseOffset,
            objectDepth + 1,
          );
          const deltaLength = compressedLength(
            bytes!.subarray(compressedStart),
          );
          const data = await inflate(
            bytes!.subarray(compressedStart, compressedStart + deltaLength),
          );
          const result = applyDelta(base.data, data);
          return { type: base.type, data: result };
        }
        if (packHeader.baseHash) {
          const base = await loadObject(packHeader.baseHash, depth + 1);
          const deltaLength = compressedLength(
            bytes!.subarray(compressedStart),
          );
          const data = await inflate(
            bytes!.subarray(compressedStart, compressedStart + deltaLength),
          );
          return { type: base.type, data: applyDelta(base.data, data) };
        }
        const objectType = packHeader.type as GitObjectType;
        const deltaLength = compressedLength(bytes!.subarray(compressedStart));
        const data = await inflate(
          bytes!.subarray(compressedStart, compressedStart + deltaLength),
        );
        if (data.length !== packHeader.size)
          throw new Error('A packed Git object has an invalid size.');
        return { type: objectType, data };
      };
      return await loadAtOffset(entry.offset, 0);
    } finally {
      resolving.delete(hash);
    }
  };

  const commits: GitCommit[] = [];
  let currentHash = head.toLowerCase();
  while (currentHash && commits.length < 5) {
    let object = await loadObject(currentHash);
    while (object.type === 'tag') {
      const target = /^object ([\da-f]{40})/m.exec(
        decoder.decode(object.data),
      )?.[1];
      if (!target)
        throw new Error('A Git tag does not reference a valid object.');
      currentHash = target;
      object = await loadObject(currentHash);
    }
    const commit = parseCommit(object, currentHash);
    commits.push(commit);
    currentHash = commit.parent ?? '';
  }
  return { head, commits };
}
