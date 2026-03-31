// Run: node scripts/generate-icons.mjs
// Generates PWA icons using canvas (requires: npm install canvas)
// Alternative: Use any online PWA icon generator

import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  const radius = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#007AFF");
  gradient.addColorStop(1, "#5856D6");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Person icon
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = "white";

  // Head
  const headR = size * 0.17;
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.08, headR, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.22, size * 0.23, size * 0.18, 0, Math.PI, 0);
  ctx.fill();

  return canvas.toBuffer("image/png");
}

try {
  writeFileSync("public/icons/icon-192.png", generateIcon(192));
  writeFileSync("public/icons/icon-512.png", generateIcon(512));
  console.log("Icons generated!");
} catch {
  console.log("Install canvas: npm install canvas");
  console.log("Or use https://favicon.io/favicon-generator/ to create icons");
}
