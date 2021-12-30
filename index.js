// Import stylesheets
import './style.css';

import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise('seed');

const w = 600;
const h = 600;

const canvas = document.createElement('canvas');

canvas.width = w;
canvas.height = h;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

const data = ctx.createImageData(w, h);

const f = (x) => Math.max(0.0, Math.min(255.0, Math.floor(x * 255.0)));

const createShape = function (ws, hs) {
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
      const c = 1.0;
      const vradius2 = lerp(
        (0.0 + 2.0 * Math.abs(simplex.noise2D(c * angle, seed))) * radius,
        (0.0 + 2.0 * Math.abs(simplex.noise2D(c * -angle, seed))) * radius,
        nangle
      );
      const currentRadius = Math.sqrt(dx * dx + dy * dy);
      const innerShape = currentRadius <= vradius2;
      const border =
        currentRadius >= vradius2 && currentRadius <= vradius2 + 1.0;
      // const idx = 4 * (y * w + x);
      const bc = () =>
        0.5 * (simplex.noise3D((0.5 * x) / ws, (0.5 * y) / ws, seed) + 1.0);

      const r = innerShape ? 0.0 : 1.0;
      const g = border ? 1.0 : 0.0;
      const b = innerShape ? bc() : 0.0;
      const a = innerShape || border ? 1.0 : 0.0;
      const t = x + ',' + y;
      colors[t] = {
        r: r,
        g: g,
        b: b,
        a: a,
        border: border ? 1.0 : 0.0,
        shape: innerShape ? bc() : 0.0,
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

const drawShape = function (cx, cy, shape, basecolor, bordercolor) {
  for (let xy in shape) {
    const xys = xy.split(',');
    const x = parseInt(xys[0]);
    const y = parseInt(xys[1]);
    const color = shape[xy];

    const x2 = cx + x;
    const y2 = cy + y;

    const idx = 4 * (y2 * w + x2);

    if (color.a > 0) {
      data.data[idx + 0] += f(
        bordercolor.r * color.border + basecolor.r * color.shape
      );
      data.data[idx + 1] += f(
        bordercolor.g * color.border + basecolor.g * color.shape
      );
      data.data[idx + 2] += f(
        bordercolor.b * color.border + basecolor.b * color.shape
      );
      data.data[idx + 3] = f(1);
    }
  }
};

const drawCircle = function (basecolor, maxi, circle, shapesize) {
  const ws = shapesize;
  const hs = shapesize;

  for (let i = 0; i < maxi; i++) {
    const shape = createShape(shapesize, shapesize);
    const radius = w * 0.1 * (circle + 1);
    const angle = (2.0 * Math.PI * i) / maxi;
    const cx =
      0.5 * w + Math.floor(radius * Math.cos(angle)) - Math.floor(0.5 * ws);
    const cy =
      0.5 * h + Math.floor(radius * Math.sin(angle)) - Math.floor(0.5 * hs);

    // const basecolor = {
    //   r: Math.random(),
    //   g: Math.random(),
    //   b: Math.random(),
    // };

    const bordercolor = {
      r: 0.0, //Math.random(),
      g: 0.0, //Math.random(),
      b: 0.0,
    };

    drawShape(cx, cy, shape, basecolor, bordercolor);
  }
};

const drawCanopy = function () {
  const shapesize = 50;
  const step = 25;

  const basecolor = {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
  };

  const bordercolor = {
    r: 0.0, //Math.random(),
    g: 0.0, //Math.random(),
    b: 0.0,
  };

  for (let cx = 0; cx < w; cx += step) {
    for (let cy = 0; cy < h; cy += step) {
      const shape = createShape(shapesize, shapesize);
      const dx = Math.floor(cx + step * (Math.random() - 0.5));
      const dy = Math.floor(cy + step * (Math.random() - 0.5));
      drawShape(dx, dy, shape, basecolor, bordercolor);
    }
  }
};

const drawCanvas = function () {
  const shapes = [];
  const maxis = [10, 10, 10, 10];
  const circles = 4;
  const sizes = [10, 25, 40, 40];

  const basecolor = {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
  };

  for (let j = 0; j < circles; j++) {
    drawCircle(basecolor, 40, j, j <= 0 ? 50 : 100);
  }

  // console.log(shapes);
  //createShape();
};

//drawCanvas();
drawCanopy();
ctx.putImageData(data, 0, 0);
