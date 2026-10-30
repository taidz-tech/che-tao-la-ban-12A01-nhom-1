/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Physics calculation module for Earth's Magnetic Dipole Field
 * and Compass Needle Alignment.
 * 
 * References:
 * - Magnetic dipole field: B(r) = (mu_0 / 4pi) * (1 / r^3) * [3(m . r_hat)r_hat - m]
 * - Local surface normal: n_hat = r_hat
 * - Horizontal magnetic field component: B_h = B - (B . n_hat)n_hat
 * - Torque on magnetic needle: tau = m_needle x B
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface MagneticState {
  position: Vector3D;
  normal: Vector3D;
  totalB: Vector3D;
  horizontalB: Vector3D;
  verticalB: number;
  bHorizontalMagnitude: number;
  bTotalMagnitude: number;
  declinationDeg: number; // Magnetic declination in degrees (-180 to 180)
  inclinationDeg: number; // Dip angle (-90 to 90)
  azimuthDeg: number;     // 0 to 360 relative to geographic North
  isNearPole: boolean;
}

export interface EarthCoords {
  latDeg: number; // -90 to +90
  lonDeg: number; // -180 to +180
}

// Earth's magnetic dipole axis tilt relative to rotational Z-axis
// The geomagnetic South pole is located near the geographic North pole (~80°N, 72°W)
// Dipole tilt angle is roughly 11.3 degrees
export const DEFAULT_DIPOLE_TILT_DEG = 11.3;
export const DEFAULT_DIPOLE_LON_DEG = -72.0;

/**
 * Normalizes a 3D vector. Returns [0,0,0] if magnitude is near zero.
 */
export function normalize(v: Vector3D): Vector3D {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-12) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Dot product of two vectors
 */
export function dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Cross product of two vectors
 */
export function cross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Convert Latitude & Longitude to 3D Cartesian coordinates on sphere of radius R.
 * Geographic coordinate system:
 * +Y is North Pole (lat +90)
 * -Y is South Pole (lat -90)
 * +Z is Prime Meridian at Equator (lat 0, lon 0)
 * +X is lon +90 (East)
 */
export function latLonToCartesian(latDeg: number, lonDeg: number, radius = 1): Vector3D {
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lonDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(phi) * Math.sin(lambda),
    y: radius * Math.sin(phi),
    z: radius * Math.cos(phi) * Math.cos(lambda),
  };
}

/**
 * Convert 3D Cartesian coordinates to Latitude & Longitude
 */
export function cartesianToLatLon(v: Vector3D): EarthCoords {
  const r = Math.hypot(v.x, v.y, v.z);
  if (r < 1e-12) return { latDeg: 0, lonDeg: 0 };
  const latDeg = (Math.asin(Math.max(-1, Math.min(1, v.y / r))) * 180) / Math.PI;
  const lonDeg = (Math.atan2(v.x, v.z) * 180) / Math.PI;
  return { latDeg, lonDeg };
}

/**
 * Get the unit vector representing Earth's magnetic dipole moment.
 * In physics: Earth's magnetic field resembles a bar magnet with magnetic SOUTH pole
 * in the Northern hemisphere, so magnetic moment vector points approximately towards
 * the geographic South/South-West.
 */
export function getEarthDipoleMoment(
  tiltDeg = DEFAULT_DIPOLE_TILT_DEG,
  lonDeg = DEFAULT_DIPOLE_LON_DEG
): Vector3D {
  // Dipole axis tilted from rotational Y axis (Southward magnetic moment)
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;
  return {
    x: -Math.sin(tiltRad) * Math.sin(lonRad),
    y: -Math.cos(tiltRad), // pointing southwards along dipole axis
    z: -Math.sin(tiltRad) * Math.cos(lonRad),
  };
}

/**
 * Calculate magnetic field B at position r produced by a dipole moment m at origin.
 * B(r) = (1 / r^3) * [ 3(m . r_hat)r_hat - m ]
 */
export function calculateDipoleField(rPos: Vector3D, mDipole: Vector3D): Vector3D {
  const rMag = Math.hypot(rPos.x, rPos.y, rPos.z);
  if (rMag < 1e-6) return { x: 0, y: 0, z: 0 };

  const rHat = { x: rPos.x / rMag, y: rPos.y / rMag, z: rPos.z / rMag };
  const mDotR = dot(mDipole, rHat);
  const factor = 1 / (rMag * rMag * rMag);

  return {
    x: factor * (3 * mDotR * rHat.x - mDipole.x),
    y: factor * (3 * mDotR * rHat.y - mDipole.y),
    z: factor * (3 * mDotR * rHat.z - mDipole.z),
  };
}

/**
 * Compute the complete magnetic state at a given location on Earth.
 * Computes the horizontal component B_h, vertical component, declination, and dip.
 */
export function computeMagneticState(
  position: Vector3D,
  dipoleMoment: Vector3D = getEarthDipoleMoment()
): MagneticState {
  const normal = normalize(position);
  const totalB = calculateDipoleField(position, dipoleMoment);
  const bTotalMagnitude = Math.hypot(totalB.x, totalB.y, totalB.z);

  // Vertical component B_v = B . n_hat
  const verticalB = dot(totalB, normal);

  // Horizontal component B_h = B - (B . n_hat)n_hat
  const horizontalB: Vector3D = {
    x: totalB.x - verticalB * normal.x,
    y: totalB.y - verticalB * normal.y,
    z: totalB.z - verticalB * normal.z,
  };

  const bHorizontalMagnitude = Math.hypot(horizontalB.x, horizontalB.y, horizontalB.z);
  const isNearPole = bHorizontalMagnitude < 1e-4 * Math.max(1e-4, bTotalMagnitude);

  // Define local Geographic coordinate frame on sphere:
  // Geographic North unit vector points in direction of increasing latitude (towards +Y)
  // Projected onto tangent plane: u_north = normalize([0, 1, 0] - ([0, 1, 0] . n)n)
  const geoNorthAxis: Vector3D = { x: 0, y: 1, z: 0 };
  const dotGeoY = dot(geoNorthAxis, normal);
  let uNorth = normalize({
    x: geoNorthAxis.x - dotGeoY * normal.x,
    y: geoNorthAxis.y - dotGeoY * normal.y,
    z: geoNorthAxis.z - dotGeoY * normal.z,
  });

  // At the geographic poles, uNorth becomes indeterminate
  if (Math.hypot(uNorth.x, uNorth.y, uNorth.z) < 1e-6) {
    uNorth = { x: 0, y: 0, z: -1 };
  }

  // Local East: uEast = normal x uNorth
  const uEast = normalize(cross(normal, uNorth));

  // Compute declination (angle from geographic North to horizontal B)
  // Positive Eastward, Negative Westward
  let declinationDeg = 0;
  let azimuthDeg = 0;

  if (!isNearPole) {
    const northProj = dot(horizontalB, uNorth);
    const eastProj = dot(horizontalB, uEast);
    const declRad = Math.atan2(eastProj, northProj);
    declinationDeg = (declRad * 180) / Math.PI;

    // Azimuth: 0 = North, 90 = East, 180 = South, 270 = West
    azimuthDeg = (declinationDeg + 360) % 360;
  }

  // Inclination / Dip angle: angle B makes with horizontal plane
  // Positive downwards (into earth), negative upwards
  const inclinationDeg = (Math.atan2(-verticalB, Math.max(1e-8, bHorizontalMagnitude)) * 180) / Math.PI;

  return {
    position,
    normal,
    totalB,
    horizontalB,
    verticalB,
    bHorizontalMagnitude,
    bTotalMagnitude,
    declinationDeg,
    inclinationDeg,
    azimuthDeg,
    isNearPole,
  };
}
