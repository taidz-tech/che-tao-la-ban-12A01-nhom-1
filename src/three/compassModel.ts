/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 3D Handcrafted Compass Model Builder
 * Assembles a composite procedural model matching the report & photos:
 * - Glass bowl (outer/inner wall, rim, base foot)
 * - Water volume with meniscus
 * - 360° waterproof Compass Rose disc at bottom
 * - Floating cork/foam puck
 * - Balanced magnetized steel needle (North painted red, South silver)
 * - Ground shadow plane
 */

import * as THREE from 'three';
import { createCompassRoseTexture, createCorkTexture } from './proceduralTextures.ts';

export interface CompassModelParts {
  group: THREE.Group;
  bowlGroup: THREE.Group;
  diskMesh: THREE.Mesh;
  floatingSystem: THREE.Group; // rotates needle + cork together
  needleGroup: THREE.Group;
  needleMesh: THREE.Mesh;
  needleNorthTip: THREE.Mesh;
  needleSouthTip: THREE.Mesh;
  corkMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  raycastTargets: THREE.Object3D[];
}

export function buildHandcraftedCompass(): CompassModelParts {
  const group = new THREE.Group();
  group.name = 'HandcraftedCompass';

  // 1. Contact Shadow Plane at base (Y = 0)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.005;
  group.add(shadowMesh);

  // 2. Glass Bowl
  // Bowl dimensions: bottom radius 0.9, top rim radius 1.35, height 0.95
  const bowlGroup = new THREE.Group();
  bowlGroup.name = 'GlassBowlGroup';

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    roughness: 0.06,
    metalness: 0.05,
    transmission: 0.88,
    transparent: true,
    opacity: 0.45,
    ior: 1.5,
    thickness: 0.25,
    depthWrite: false,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  // Lathe geometry for smooth curved glass bowl cross-section
  const bowlPoints: THREE.Vector2[] = [];
  // Bottom center to edge
  bowlPoints.push(new THREE.Vector2(0, 0.02));
  bowlPoints.push(new THREE.Vector2(0.9, 0.02));
  bowlPoints.push(new THREE.Vector2(0.98, 0.08));
  bowlPoints.push(new THREE.Vector2(1.15, 0.35));
  bowlPoints.push(new THREE.Vector2(1.35, 0.92));
  bowlPoints.push(new THREE.Vector2(1.36, 0.95)); // top rim
  bowlPoints.push(new THREE.Vector2(1.33, 0.95));
  bowlPoints.push(new THREE.Vector2(1.3, 0.9));
  bowlPoints.push(new THREE.Vector2(1.1, 0.35));
  bowlPoints.push(new THREE.Vector2(0.92, 0.09));
  bowlPoints.push(new THREE.Vector2(0.85, 0.05));
  bowlPoints.push(new THREE.Vector2(0, 0.05));

  const bowlGeo = new THREE.LatheGeometry(bowlPoints, 48);
  const bowlMesh = new THREE.Mesh(bowlGeo, glassMat);
  bowlMesh.castShadow = false;
  bowlMesh.receiveShadow = true;
  bowlMesh.renderOrder = 3;
  bowlMesh.userData = {
    partId: 'bowl',
    partName: 'Bát đựng nước (Glass Bowl)',
    description:
      'Làm bằng thủy tinh hoặc vật liệu phi từ tính (nhựa/sứ), không gây nhiễu từ trường Trái Đất. Tạo không gian chứa nước để hệ kim nổi quay tự do với ma sát cực tiểu.',
  };
  bowlGroup.add(bowlMesh);

  // 3. 360° Waterproof Compass Rose Disc (at bottom of bowl)
  const diskTex = createCompassRoseTexture();
  const diskGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.015, 64);
  const diskMat = new THREE.MeshStandardMaterial({
    map: diskTex,
    roughness: 0.3,
    metalness: 0.05,
  });
  const diskMesh = new THREE.Mesh(diskGeo, diskMat);
  diskMesh.rotation.y = -Math.PI / 2; // Orient N to align with needle North axis (+Z)
  diskMesh.position.y = 0.055; // sits right inside inner bowl bottom
  diskMesh.renderOrder = 1;
  diskMesh.userData = {
    partId: 'disk',
    partName: 'Đĩa tọa độ 360° (Compass Rose)',
    description:
      'Được làm bằng nhựa chống thấm nước (PVC mỏng/bìa dẻo ép), vẽ bằng bút sơn dầu/permanent marker không bị lem mực. Đặt ở đáy bát, dùng để đối chiếu góc phương vị (0°–360°) khi căn chỉnh trùng với đầu Bắc của kim.',
  };
  group.add(diskMesh);

  // 4. Water Volume inside bowl
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.03,
    metalness: 0.02,
    transmission: 0.75,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    ior: 1.333,
  });
  // Water surface cylinder at Y = 0.65
  const waterGeo = new THREE.CylinderGeometry(1.22, 0.88, 0.58, 48);
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = 0.34;
  waterMesh.renderOrder = 2;
  waterMesh.userData = {
    partId: 'water',
    partName: 'Nước trong bát',
    description:
      'Môi trường chất lỏng giảm triệt để lực ma sát cơ học, cho phép momen ngẫu lực từ cực nhỏ của từ trường Trái Đất (τ = m × B) xoay chuyển kim nhẹ nhàng và chính xác.',
  };
  group.add(waterMesh);

  // 5. Floating System (Cork/Foam + Magnetized Needle)
  // Water surface level is at Y = 0.63
  const floatingSystem = new THREE.Group();
  floatingSystem.name = 'FloatingSystem';
  floatingSystem.position.y = 0.63; // water surface

  // Cork puck: small cylindrical cork/foam slice, radius 0.22, height 0.12
  const corkTex = createCorkTexture();
  const corkMat = new THREE.MeshStandardMaterial({
    map: corkTex,
    color: 0xecd5ba,
    roughness: 0.85,
    metalness: 0.02,
  });
  const corkGeo = new THREE.CylinderGeometry(0.22, 0.21, 0.11, 32);
  const corkMesh = new THREE.Mesh(corkGeo, corkMat);
  corkMesh.position.y = 0.03; // floats half submerged
  corkMesh.castShadow = true;
  corkMesh.receiveShadow = true;
  corkMesh.userData = {
    partId: 'cork',
    partName: 'Vật liệu nổi (Miếng xốp / Nút chai)',
    description:
      'Miếng xốp nhỏ hoặc nút chai rượu vang cắt mỏng nhẹ, có sức căng bề mặt và lực đẩy Ác-si-mét nâng đỡ kim nằm thăng bằng theo phương ngang trên mặt nước.',
  };
  floatingSystem.add(corkMesh);

  // 6. Magnetized Steel Needle
  const needleGroup = new THREE.Group();
  needleGroup.name = 'MagnetizedNeedle';
  needleGroup.position.y = 0.088; // rests balanced on top of or through cork

  // Steel needle shaft: length 0.95 (approx 4-5cm scaled), slender bevelled diamond cross section
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.18,
  });

  const northRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Vivid lacquer red for North tip
    metalness: 0.45,
    roughness: 0.25,
  });

  // Shaft center
  const shaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 16);
  const needleMesh = new THREE.Mesh(shaftGeo, steelMat);
  needleMesh.rotation.x = Math.PI / 2; // lie horizontal along Z axis
  needleGroup.add(needleMesh);

  // North tip: Cone + pyramid pointing toward +Z (North) painted bright red
  const northTipGeo = new THREE.ConeGeometry(0.018, 0.26, 16);
  const needleNorthTip = new THREE.Mesh(northTipGeo, northRedMat);
  needleNorthTip.rotation.x = Math.PI / 2;
  needleNorthTip.position.z = 0.40;
  needleNorthTip.castShadow = true;
  needleGroup.add(needleNorthTip);

  // South tip: tapered cone pointing toward -Z (South) silver steel
  const southTipGeo = new THREE.ConeGeometry(0.018, 0.24, 16);
  const needleSouthTip = new THREE.Mesh(southTipGeo, steelMat);
  needleSouthTip.rotation.x = -Math.PI / 2;
  needleSouthTip.position.z = -0.39;
  needleSouthTip.castShadow = true;
  needleGroup.add(needleSouthTip);

  // Eyelet ring at needle base
  const eyeletGeo = new THREE.TorusGeometry(0.018, 0.005, 8, 16);
  const eyeletMesh = new THREE.Mesh(eyeletGeo, steelMat);
  eyeletMesh.position.z = -0.49;
  needleGroup.add(eyeletMesh);

  // North Indicator Ring / Label Pin
  const northMarkerGeo = new THREE.SphereGeometry(0.022, 12, 12);
  const northMarkerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const northMarker = new THREE.Mesh(northMarkerGeo, northMarkerMat);
  northMarker.position.set(0, 0.03, 0.45);
  needleGroup.add(northMarker);

  needleGroup.userData = {
    partId: 'needle',
    partName: 'Kim từ tính (Magnetized Needle)',
    description:
      'Kim khâu thép đã nhiễm từ bằng cách vuốt nam châm một chiều 30–40 lần. Dưới tác dụng của từ trường Trái Đất, đầu cực Bắc (sơn đỏ) luôn bị hút và chỉ về hướng Cực Bắc địa lý.',
  };

  floatingSystem.add(needleGroup);
  group.add(floatingSystem);
  group.add(bowlGroup);

  const raycastTargets: THREE.Object3D[] = [
    needleGroup,
    needleMesh,
    needleNorthTip,
    corkMesh,
    waterMesh,
    diskMesh,
    bowlMesh,
  ];

  return {
    group,
    bowlGroup,
    diskMesh,
    floatingSystem,
    needleGroup,
    needleMesh,
    needleNorthTip,
    needleSouthTip,
    corkMesh,
    waterMesh,
    raycastTargets,
  };
}
