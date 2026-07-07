import sharp from "sharp"

export async function compressAvatar(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(512, 512, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer()
}
