// multer's fileFilter only sees the client-supplied mimetype, which anyone can
// set to image/png on an HTML or SVG payload. Checking the leading bytes of the
// buffer confirms the file really is one of the raster formats we serve.
export const isAllowedImage = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  const startsWith = (bytes: number[], offset = 0) =>
    bytes.every((byte, i) => buffer[offset + i] === byte);

  const isJpeg = startsWith([0xff, 0xd8, 0xff]);
  const isPng = startsWith([0x89, 0x50, 0x4e, 0x47]);
  const isGif = startsWith([0x47, 0x49, 0x46, 0x38]); // "GIF8"
  // "RIFF" <4-byte size> "WEBP"
  const isWebp =
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8);

  return isJpeg || isPng || isGif || isWebp;
};
