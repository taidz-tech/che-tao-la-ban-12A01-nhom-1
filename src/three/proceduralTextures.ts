/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Procedural texture generation for Three.js:
 * 1. 360° Compass Rose Dial (matching the user's PDF and experiment photos)
 * 2. High-resolution procedural Earth texture (continents, oceans, grids, poles)
 * 3. Floating cork/foam material texture
 * 4. Water surface ripple texture
 */

import * as THREE from 'three';

/**
 * Generates a 2048x2048 crisp procedural Compass Rose 360° dial texture.
 */
export function createCompassRoseTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const tickOuterR = outerR;
  const tick10R = size * 0.415;
  const tick5R = size * 0.43;
  const tick1R = size * 0.445;
  const labelR = size * 0.385;
  const starMajorR = size * 0.35;
  const starMinorR = size * 0.22;
  const innerHubR = size * 0.055;

  // Background: clean waterproof plastic white disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 25, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();

  // Subtle circular guide lines
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(cx, cy, tick10R, 0, Math.PI * 2);
  ctx.arc(cx, cy, starMajorR * 0.95, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 360 degree ticks
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let deg = 0; deg < 360; deg++) {
    const rad = ((deg - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let innerRadius = tick1R;
    let lineWidth = 2;
    let strokeColor = '#64748b';

    if (deg % 10 === 0) {
      innerRadius = tick10R;
      lineWidth = 5;
      strokeColor = '#0f172a';
    } else if (deg % 5 === 0) {
      innerRadius = tick5R;
      lineWidth = 3.5;
      strokeColor = '#334155';
    }

    ctx.beginPath();
    ctx.moveTo(cx + tickOuterR * cos, cy + tickOuterR * sin);
    ctx.lineTo(cx + innerRadius * cos, cy + innerRadius * sin);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Degree numbers at each 10° or 30°
    if (deg % 10 === 0 && deg % 45 !== 0) {
      const numX = cx + labelR * cos;
      const numY = cy + labelR * sin;
      ctx.save();
      ctx.translate(numX, numY);
      // rotate text to face outward or readable
      ctx.rotate(rad + Math.PI / 2);
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${deg}`, 0, 0);
      ctx.restore();
    }
  }

  // Draw 8-point faceted Compass Rose Star
  const directions = [
    { label: 'N', deg: 0, val: '/360', color: '#dc2626', isMajor: true },
    { label: 'NE', deg: 45, val: '45°', color: '#1e293b', isMajor: false },
    { label: 'E', deg: 90, val: '90°', color: '#0f172a', isMajor: true },
    { label: 'SE', deg: 135, val: '135°', color: '#1e293b', isMajor: false },
    { label: 'S', deg: 180, val: '180°', color: '#0f172a', isMajor: true },
    { label: 'SW', deg: 225, val: '225°', color: '#1e293b', isMajor: false },
    { label: 'W', deg: 270, val: '270°', color: '#0f172a', isMajor: true },
    { label: 'NW', deg: 315, val: '315°', color: '#1e293b', isMajor: false },
  ];

  // Draw faceted star points
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45 - 90) * Math.PI) / 180;
    const isMajor = i % 2 === 0;
    const peakR = isMajor ? starMajorR : starMinorR;
    const prevAngle = (((i * 45 - 22.5) - 90) * Math.PI) / 180;
    const nextAngle = (((i * 45 + 22.5) - 90) * Math.PI) / 180;

    const tipX = cx + peakR * Math.cos(angle);
    const tipY = cy + peakR * Math.sin(angle);
    const leftX = cx + innerHubR * Math.cos(prevAngle);
    const leftY = cy + innerHubR * Math.sin(prevAngle);
    const rightX = cx + innerHubR * Math.cos(nextAngle);
    const rightY = cy + innerHubR * Math.sin(nextAngle);

    // Left half (Darker)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fillStyle = isMajor ? (i === 0 ? '#b91c1c' : '#0f172a') : '#475569';
    ctx.fill();

    // Right half (Lighter)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = isMajor ? (i === 0 ? '#ef4444' : '#64748b') : '#94a3b8';
    ctx.fill();
  }

  // Draw central circular ring
  ctx.beginPath();
  ctx.arc(cx, cy, innerHubR * 1.25, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerHubR * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Draw major labels (N, NE, E, SE, S, SW, W, NW)
  for (const d of directions) {
    const rad = ((d.deg - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const textDist = d.isMajor ? size * 0.32 : size * 0.285;

    ctx.save();
    ctx.translate(cx + textDist * cos, cy + textDist * sin);

    if (d.label === 'N') {
      ctx.font = 'bold 88px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('N', 0, -20);
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillStyle = '#991b1b';
      ctx.fillText('0° / 360°', 0, 40);
    } else if (d.isMajor) {
      ctx.font = 'bold 76px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(d.label, 0, 0);
    } else {
      ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(d.label, 0, 0);
    }
    ctx.restore();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Generates high-res 2048x1024 procedural Earth texture
 * with continents, oceanic topography, lat/long grids, and labeled equator/poles.
 */
export function createEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c2340');
  oceanGrad.addColorStop(0.3, '#0b3954');
  oceanGrad.addColorStop(0.5, '#087e8b');
  oceanGrad.addColorStop(0.7, '#0b3954');
  oceanGrad.addColorStop(1, '#0c2340');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Continental landmass paths (equirectangular projection approximations)
  const drawLandmass = (pts: [number, number][], color: string) => {
    ctx.beginPath();
    pts.forEach(([x, y], idx) => {
      const px = (x / 360 + 0.5) * width;
      const py = (0.5 - y / 180) * height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
  };

  const landGreen = '#14532d';
  const landSavanna = '#166534';
  const landIce = '#e2e8f0';

  // Eurasia & North Africa
  drawLandmass(
    [
      [-10, 36], [0, 44], [10, 48], [30, 70], [60, 72], [100, 76], [140, 72],
      [170, 66], [140, 40], [120, 30], [105, 20], [80, 10], [50, 25],
      [35, 32], [20, 15], [10, 5], [-15, 12], [-15, 30], [-10, 36]
    ],
    landSavanna
  );

  // Sub-Saharan Africa
  drawLandmass(
    [
      [-15, 12], [10, 5], [40, 10], [50, 10], [40, -10], [30, -34],
      [20, -34], [12, -18], [5, 4], [-15, 12]
    ],
    landGreen
  );

  // North America
  drawLandmass(
    [
      [-165, 65], [-130, 55], [-120, 35], [-105, 20], [-80, 25], [-75, 40],
      [-60, 50], [-70, 65], [-100, 72], [-140, 70], [-165, 65]
    ],
    landSavanna
  );

  // South America
  drawLandmass(
    [
      [-80, 10], [-50, -5], [-35, -8], [-40, -22], [-65, -55], [-75, -45],
      [-80, -10], [-80, 10]
    ],
    landGreen
  );

  // Australia
  drawLandmass(
    [
      [115, -22], [130, -12], [145, -15], [150, -35], [135, -35], [115, -30], [115, -22]
    ],
    landSavanna
  );

  // Antarctica & Greenland
  drawLandmass(
    [
      [-180, -70], [180, -70], [180, -90], [-180, -90]
    ],
    landIce
  );
  drawLandmass(
    [
      [-50, 60], [-20, 70], [-25, 82], [-55, 82], [-50, 60]
    ],
    landIce
  );

  // Latitude and Longitude Grids
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;

  // Latitudes every 30 degrees
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = (0.5 - lat / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Longitudes every 30 degrees
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = (lon / 360 + 0.5) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator (Golden dotted line)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Labels: Equator, Poles
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('ĐƯỜNG XÍCH ĐẠO (0°)', 40, height / 2 - 10);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText('CỰC BẮC ĐỊA LÝ (+90°)', width / 2 - 120, 40);
  ctx.fillText('CỰC NAM ĐỊA LÝ (-90°)', width / 2 - 120, height - 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates a cork / styrofoam puck procedural texture
 */
export function createCorkTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm cork base
  ctx.fillStyle = '#d7b38c';
  ctx.fillRect(0, 0, size, height(size));

  // Cellular noise specks
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 1;
    ctx.fillStyle = Math.random() > 0.5 ? '#b88f65' : '#eed7be';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function height(s: number) { return s; }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
