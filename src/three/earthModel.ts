/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 3D Earth Globe with Dipole Magnetic Field Model
 * Features:
 * - Earth sphere with high-res procedural continents & oceans
 * - Geographic rotational axis (+Y North pole, -Y South pole)
 * - Tilted Geomagnetic Dipole axis (~11.3° tilt)
 * - 3D Parametric Dipole Magnetic Field loops (r = R0 * sin^2(theta))
 * - Interactive Location Probe with local field vector display
 */

import * as THREE from 'three';
import { createEarthTexture } from './proceduralTextures.ts';
import {
  DEFAULT_DIPOLE_TILT_DEG,
  DEFAULT_DIPOLE_LON_DEG,
  latLonToCartesian,
  computeMagneticState,
  MagneticState,
} from '../physics/magneticField.ts';

export interface EarthModelSystem {
  group: THREE.Group;
  globeMesh: THREE.Mesh;
  fieldLinesGroup: THREE.Group;
  geoAxisGroup: THREE.Group;
  magneticAxisGroup: THREE.Group;
  probeGroup: THREE.Group;
  vectorsGroup: THREE.Group;
  updateProbeLocation: (latDeg: number, lonDeg: number) => MagneticState;
  setFieldLinesVisible: (visible: boolean) => void;
  setAxesVisible: (visible: boolean) => void;
}

export function buildEarthMagneticSystem(earthRadius = 1.6): EarthModelSystem {
  const group = new THREE.Group();
  group.name = 'EarthMagneticSystem';

  // 1. Earth Globe Mesh
  const earthTex = createEarthTexture();
  const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 48);
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.65,
    metalness: 0.08,
  });
  const globeMesh = new THREE.Mesh(earthGeo, earthMat);
  globeMesh.castShadow = true;
  globeMesh.receiveShadow = true;
  group.add(globeMesh);

  // Atmosphere Glow Shell
  const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.025, 48, 36);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
  });
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
  group.add(atmosMesh);

  // 2. Geographic Rotational Axis (+Y North, -Y South)
  const geoAxisGroup = new THREE.Group();
  geoAxisGroup.name = 'GeographicAxis';

  const axisGeo = new THREE.CylinderGeometry(0.012, 0.012, earthRadius * 2.8, 16);
  const geoAxisMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Gold
  const geoAxisMesh = new THREE.Mesh(axisGeo, geoAxisMat);
  geoAxisGroup.add(geoAxisMesh);

  // North Geographic Pole Marker
  const poleNGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const poleNMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const poleN = new THREE.Mesh(poleNGeo, poleNMat);
  poleN.position.y = earthRadius * 1.35;
  geoAxisGroup.add(poleN);

  // South Geographic Pole Marker
  const poleS = poleN.clone();
  poleS.position.y = -earthRadius * 1.35;
  geoAxisGroup.add(poleS);

  group.add(geoAxisGroup);

  // 3. Geomagnetic Dipole Axis (tilted)
  const magneticAxisGroup = new THREE.Group();
  magneticAxisGroup.name = 'MagneticAxis';

  const magAxisGeo = new THREE.CylinderGeometry(0.015, 0.015, earthRadius * 2.7, 16);
  const magAxisMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 }); // Cyan
  const magAxisMesh = new THREE.Mesh(magAxisGeo, magAxisMat);
  magneticAxisGroup.add(magAxisMesh);

  // Geomagnetic South Pole Marker in Northern hemisphere (Blue, attracts needle's North tip)
  const magSouthGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 16);
  const magSouthMat = new THREE.MeshBasicMaterial({ color: 0x2563eb }); // Blue "S"
  const magSouth = new THREE.Mesh(magSouthGeo, magSouthMat);
  magSouth.position.y = earthRadius * 1.3;
  magneticAxisGroup.add(magSouth);

  // Geomagnetic North Pole Marker in Southern hemisphere (Red)
  const magNorthMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 }); // Red "N"
  const magNorth = new THREE.Mesh(magSouthGeo, magNorthMat);
  magNorth.position.y = -earthRadius * 1.3;
  magneticAxisGroup.add(magNorth);

  // Tilt magnetic axis by DEFAULT_DIPOLE_TILT_DEG (~11.3°)
  const tiltRad = (DEFAULT_DIPOLE_TILT_DEG * Math.PI) / 180;
  const lonRad = (DEFAULT_DIPOLE_LON_DEG * Math.PI) / 180;
  magneticAxisGroup.rotation.z = tiltRad * Math.cos(lonRad);
  magneticAxisGroup.rotation.x = -tiltRad * Math.sin(lonRad);

  group.add(magneticAxisGroup);

  // 4. Dipole Magnetic Field Lines (3D Curved Loops)
  // Dipole equation: r(theta) = R_max * sin^2(theta)
  const fieldLinesGroup = new THREE.Group();
  fieldLinesGroup.name = 'FieldLinesGroup';

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
  });

  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

  // Generate field loops around the dipole axis
  const shellRadii = [earthRadius * 1.5, earthRadius * 2.1, earthRadius * 2.8, earthRadius * 3.6];
  const longitudes = [0, 45, 90, 135, 180, 225, 270, 315];

  for (const rMax of shellRadii) {
    for (const lonDeg of longitudes) {
      const phi = (lonDeg * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      const numPts = 64;

      // theta runs from theta_min to (pi - theta_min) where r >= earthRadius
      const sinThetaMin = Math.sqrt(Math.min(0.95, earthRadius / rMax));
      const thetaMin = Math.asin(sinThetaMin);
      const thetaMax = Math.PI - thetaMin;

      for (let i = 0; i <= numPts; i++) {
        const theta = thetaMin + (i / numPts) * (thetaMax - thetaMin);
        const r = rMax * Math.sin(theta) * Math.sin(theta);

        // Coordinates in dipole frame:
        // z_dipole along dipole axis (+Y_dipole), cylindrical rho = r * sin(theta)
        const y_dipole = r * Math.cos(theta);
        const rho = r * Math.sin(theta);
        const x_dipole = rho * Math.sin(phi);
        const z_dipole = rho * Math.cos(phi);

        points.push(new THREE.Vector3(x_dipole, y_dipole, z_dipole));
      }

      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveLine = new THREE.Line(curveGeo, lineMat);

      // Add a small directional cone along the curve at the equator
      const midIdx = Math.floor(numPts / 2);
      const pMid = points[midIdx];
      const pNext = points[midIdx + 1] || points[midIdx];
      const dir = new THREE.Vector3().subVectors(pNext, pMid).normalize();

      const coneGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
      const arrowMesh = new THREE.Mesh(coneGeo, arrowMat);
      arrowMesh.position.copy(pMid);
      arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      const loopGroup = new THREE.Group();
      loopGroup.add(curveLine);
      loopGroup.add(arrowMesh);

      // Orient loop relative to dipole tilt
      loopGroup.rotation.z = tiltRad * Math.cos(lonRad);
      loopGroup.rotation.x = -tiltRad * Math.sin(lonRad);

      fieldLinesGroup.add(loopGroup);
    }
  }

  group.add(fieldLinesGroup);

  // 5. Interactive Location Probe & Vectors
  const probeGroup = new THREE.Group();
  probeGroup.name = 'LocationProbe';

  // Probe base ring & pin
  const pinGeo = new THREE.CylinderGeometry(0.02, 0.05, 0.22, 16);
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0x10b981, // Emerald pin
    metalness: 0.8,
    roughness: 0.2,
  });
  const pinMesh = new THREE.Mesh(pinGeo, pinMat);
  pinMesh.position.y = 0.11;
  probeGroup.add(pinMesh);

  const beaconGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.y = 0.24;
  probeGroup.add(beaconMesh);

  // Mini compass plate on probe
  const miniPlateGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.015, 32);
  const miniPlateMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
  });
  const miniPlate = new THREE.Mesh(miniPlateGeo, miniPlateMat);
  miniPlate.position.y = 0.01;
  probeGroup.add(miniPlate);

  // Mini compass needle on probe
  const miniNeedleGroup = new THREE.Group();
  miniNeedleGroup.name = 'MiniProbeNeedle';
  miniNeedleGroup.position.y = 0.03;

  const miniNeedleNGeo = new THREE.ConeGeometry(0.025, 0.2, 8);
  const miniNeedleNMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const miniNeedleN = new THREE.Mesh(miniNeedleNGeo, miniNeedleNMat);
  miniNeedleN.rotation.x = Math.PI / 2;
  miniNeedleN.position.z = 0.09;

  const miniNeedleSMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const miniNeedleS = new THREE.Mesh(miniNeedleNGeo, miniNeedleSMat);
  miniNeedleS.rotation.x = -Math.PI / 2;
  miniNeedleS.position.z = -0.09;

  miniNeedleGroup.add(miniNeedleN);
  miniNeedleGroup.add(miniNeedleS);
  probeGroup.add(miniNeedleGroup);

  // 6. Vector visualization arrows (Normal n, Total B, Horizontal B_h)
  const vectorsGroup = new THREE.Group();
  vectorsGroup.name = 'ProbeVectors';

  // Total B vector (Cyan arrow)
  const arrowB = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    0.65,
    0x06b6d4,
    0.12,
    0.06
  );
  // Horizontal B_h vector (Emerald arrow)
  const arrowBh = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    0.6,
    0x10b981,
    0.12,
    0.06
  );
  // Geographic North unit vector (Amber arrow)
  const arrowGeoN = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    0.45,
    0xf59e0b,
    0.1,
    0.05
  );

  vectorsGroup.add(arrowB);
  vectorsGroup.add(arrowBh);
  vectorsGroup.add(arrowGeoN);
  probeGroup.add(vectorsGroup);

  group.add(probeGroup);

  /**
   * Updates location probe to new lat/lon, orienting probe tangent to sphere surface
   * and updating vectors and mini needle.
   */
  const updateProbeLocation = (latDeg: number, lonDeg: number): MagneticState => {
    const cartPos = latLonToCartesian(latDeg, lonDeg, earthRadius);
    probeGroup.position.set(cartPos.x, cartPos.y, cartPos.z);

    // Orient probe so its local +Y aligns with surface normal
    const normal = new THREE.Vector3(cartPos.x, cartPos.y, cartPos.z).normalize();
    probeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    // Compute magnetic physics state
    const state = computeMagneticState(
      { x: cartPos.x, y: cartPos.y, z: cartPos.z },
    );

    // In probe's local frame:
    // Update vector arrows
    // Transform global horizontalB to probe's local tangent plane
    const invProbeQuat = probeGroup.quaternion.clone().invert();

    const localTotalB = new THREE.Vector3(state.totalB.x, state.totalB.y, state.totalB.z)
      .applyQuaternion(invProbeQuat)
      .normalize();
    arrowB.setDirection(localTotalB);

    const localBh = new THREE.Vector3(state.horizontalB.x, state.horizontalB.y, state.horizontalB.z)
      .applyQuaternion(invProbeQuat)
      .normalize();
    arrowBh.setDirection(localBh);

    // Local Geographic North is tangent toward +Y_geo
    const geoNAxis = new THREE.Vector3(0, 1, 0);
    const dotN = geoNAxis.dot(normal);
    const uNorth = geoNAxis.clone().sub(normal.clone().multiplyScalar(dotN)).normalize();
    const localGeoN = uNorth.applyQuaternion(invProbeQuat).normalize();
    arrowGeoN.setDirection(localGeoN);

    // Rotate mini needle to align with horizontal field
    const angleRad = Math.atan2(localBh.x, localBh.z);
    miniNeedleGroup.rotation.y = angleRad;

    return state;
  };

  const setFieldLinesVisible = (visible: boolean) => {
    fieldLinesGroup.visible = visible;
  };

  const setAxesVisible = (visible: boolean) => {
    geoAxisGroup.visible = visible;
    magneticAxisGroup.visible = visible;
  };

  // Default initialize at Hanoi, Vietnam
  updateProbeLocation(21.0285, 105.8542);

  return {
    group,
    globeMesh,
    fieldLinesGroup,
    geoAxisGroup,
    magneticAxisGroup,
    probeGroup,
    vectorsGroup,
    updateProbeLocation,
    setFieldLinesVisible,
    setAxesVisible,
  };
}
