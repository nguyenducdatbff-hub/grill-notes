import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });
for (const size of [192, 512]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#171717"/><text x="50%" y="54%" font-size="${Math.round(size * 0.5)}" fill="#ffffff" font-family="sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">G</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/icons/icon-${size}.png`);
}
console.log("icons written");
