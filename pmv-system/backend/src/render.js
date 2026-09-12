import { PNG } from 'pngjs';

function parseColor(c) {
  if (!c) return [0, 0, 0];
  if (c[0] === '#') {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = c.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return [255, 176, 0];
}

// snapshot = { w, h, px: [[x, y, color], ...], background? }  (exatamente o que o editor gera)
export function renderPng(snapshot) {
  const { w, h, px = [], background = '#000000' } = snapshot;
  const png = new PNG({ width: w, height: h });
  const [br, bgc, bb] = parseColor(background);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    png.data[o] = br; png.data[o + 1] = bgc; png.data[o + 2] = bb; png.data[o + 3] = 255;
  }
  for (const [x, y, color] of px) {
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const [r, g, b] = parseColor(color);
    const o = (y * w + x) * 4;
    png.data[o] = r; png.data[o + 1] = g; png.data[o + 2] = b; png.data[o + 3] = 255;
  }
  return PNG.sync.write(png);
}
