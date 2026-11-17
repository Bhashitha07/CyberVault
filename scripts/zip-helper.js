const fs = require("fs");
const path = require("path");

// CRC32 implementation
function makeCrcTable() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}
const crcTable = makeCrcTable();

function getCrc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createZip(files) {
  // files: array of { name: string, content: Buffer }
  const localHeaders = [];
  const centralDirectoryHeaders = [];
  let currentOffset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf-8");
    const dataBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf-8");
    const crc = getCrc32(dataBuf);
    const size = dataBuf.length;

    // Local Header (30 bytes + name length)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed (2.0)
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // compression method (0 = store)
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(size, 18); // compressed size
    localHeader.writeUInt32LE(size, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28); // extra field length
    nameBuf.copy(localHeader, 30);

    const localChunk = Buffer.concat([localHeader, dataBuf]);
    localHeaders.push(localChunk);

    // Central Directory Header (46 bytes + name length)
    const cdHeader = Buffer.alloc(46 + nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // signature
    cdHeader.writeUInt16LE(20, 4); // version made by
    cdHeader.writeUInt16LE(20, 6); // version needed
    cdHeader.writeUInt16LE(0, 8); // flags
    cdHeader.writeUInt16LE(0, 10); // compression method (0)
    cdHeader.writeUInt16LE(0, 12); // mod time
    cdHeader.writeUInt16LE(0, 14); // mod date
    cdHeader.writeUInt32LE(crc, 16); // crc32
    cdHeader.writeUInt32LE(size, 20); // compressed size
    cdHeader.writeUInt32LE(size, 24); // uncompressed size
    cdHeader.writeUInt16LE(nameBuf.length, 28); // file name length
    cdHeader.writeUInt16LE(0, 30); // extra field length
    cdHeader.writeUInt16LE(0, 32); // comment length
    cdHeader.writeUInt16LE(0, 34); // disk number start
    cdHeader.writeUInt16LE(0, 36); // internal file attributes
    cdHeader.writeUInt32LE(0, 38); // external file attributes
    cdHeader.writeUInt32LE(currentOffset, 42); // relative offset of local header
    nameBuf.copy(cdHeader, 46);

    centralDirectoryHeaders.push(cdHeader);
    currentOffset += localChunk.length;
  }

  const centralDirBuf = Buffer.concat(centralDirectoryHeaders);
  const cdOffset = currentOffset;
  const cdSize = centralDirBuf.length;

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(files.length, 8); // total records on disk
  eocd.writeUInt16LE(files.length, 10); // total records in central dir
  eocd.writeUInt32LE(cdSize, 12); // central directory size
  eocd.writeUInt32LE(cdOffset, 16); // offset of central dir
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, centralDirBuf, eocd]);
}

module.exports = { createZip };
