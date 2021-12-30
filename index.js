// Import stylesheets
import './style.css';

import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise('seed');

const w = 600;
const h = 600;

const ws = 100;
const hs = 100;

const canvas = document.createElement('canvas');

canvas.width = w;
canvas.height = h;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

const data = ctx.createImageData(w, h);

const f = (x) => Math.max(0.0, Math.min(255.0, Math.floor(x * 255.0)));

const createShape = function () {
  const colors = {};
  const seed = new Date().getTime();
  for (let x = 0; x < ws; x++) {
    for (let y = 0; y < hs; y++) {
      const dx = x - 0.5 * ws;
      const dy = y - 0.5 * hs;
      const radius = 0.5 * Math.max(ws, hs);
      const innerCircle = Math.sqrt(dx * dx + dy * dy) <= radius;
      const vradius =
        (0.75 + 0.25 * Math.sin(10.0 * Math.atan2(dy, dx))) * radius;
      const lerp = (x, y, a) => x * (1 - a) + y * a;
      const dlerp = (x, a) => lerp(x, x, a);
      const angle = Math.atan2(dy, dx) + Math.PI;
      const nangle = angle / Math.PI / 2.0;
      const c = 0.5;
      const vradius2 = lerp(
        (0.5 + 0.5 * Math.abs(simplex.noise2D(c * angle, seed))) * radius,
        (0.5 + 0.5 * Math.abs(simplex.noise2D(c * -angle, seed))) * radius,
        nangle
      );
      const currentRadius = Math.sqrt(dx * dx + dy * dy);
      const innerShape = currentRadius <= vradius2;
      const border =
        currentRadius >= vradius2 && currentRadius <= vradius2 + 4.0;
      // const idx = 4 * (y * w + x);
      const r = innerShape ? 0.0 : 1.0;
      const g = border ? 1.0 : 0.0;
      const b = innerShape ? 1.0 : 0.0;
      const a = innerShape || border ? 1.0 : 0.0;
      const t = x + ',' + y;
      colors[t] = {
        r: r,
        g: g,
        b: b,
        a: a,
      };
    }
  }
  return colors;
};

for (let x = 0; x < w; x++) {
  for (let y = 0; y < h; y++) {
    const idx = 4 * (y * w + x);
    data.data[idx + 0] = 0;
    data.data[idx + 1] = 0;
    data.data[idx + 2] = 0;
    data.data[idx + 3] = f(1);
  }
}

const shapes = [];
const maxi = 10;
const shape = createShape();
for (let i = 0; i < maxi; i++) {
  const radius = w * 0.25;
  const angle = (2.0 * Math.PI * i) / maxi;
  const cx = 0.5 * w + radius * Math.cos(angle);
  const cy = 0.5 * h + radius * Math.sin(angle);

  // const idx = 4 * ((cy + 0) * w + (cx + 0));
  // data.data[idx + 2] = f(1);
  console.log(i, angle, cx, cy);

  for (let x = 0; x < ws; x++) {
    for (let y = 0; y < hs; y++) {
      const idx = 4 * ((cy + y) * w + (cx + x));
      data.data[idx + 0] = f(1);
      // data.data[idx + 3] = f(1);
    }
  }
  continue;

  for (let xy in shape) {
    const xys = xy.split(',');
    const x = parseInt(xys[0]);
    const y = parseInt(xys[1]);
    const color = shape[xy];

    const x2 = cx + x;
    const y2 = cy + y;

    const idx = 4 * (y2 * w + x2);
    data.data[idx + 0] = f(1);

    if (color.a > 0) {
      data.data[idx + 0] += f(color.r * color.a);
      data.data[idx + 1] += f(color.g * color.a);
      data.data[idx + 2] += f(color.b * color.a);
      data.data[idx + 3] = f(1);
    }
  }
  shapes.push(shape);
}
// console.log(shapes);
//createShape();

ctx.putImageData(data, 0, 0);
