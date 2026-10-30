/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  latLonToCartesian,
  cartesianToLatLon,
  calculateDipoleField,
  computeMagneticState,
  getEarthDipoleMoment,
  dot,
  normalize,
} from './magneticField.ts';

test('vector math helpers work correctly', () => {
  const norm = normalize({ x: 3, y: 4, z: 0 });
  assert.ok(Math.abs(norm.x - 0.6) < 1e-6);
  assert.ok(Math.abs(norm.y - 0.8) < 1e-6);
  assert.equal(norm.z, 0);

  const zero = normalize({ x: 0, y: 0, z: 0 });
  assert.deepEqual(zero, { x: 0, y: 0, z: 0 });

  const d = dot({ x: 1, y: 2, z: 3 }, { x: 4, y: -5, z: 6 });
  assert.equal(d, 4 - 10 + 18); // 12
});

test('geographic coordinate transformations invert accurately', () => {
  // Test Hanoi, Vietnam: lat 21.0285, lon 105.8542
  const hanoiPos = latLonToCartesian(21.0285, 105.8542, 1);
  const back = cartesianToLatLon(hanoiPos);

  assert.ok(Math.abs(back.latDeg - 21.0285) < 1e-3);
  assert.ok(Math.abs(back.lonDeg - 105.8542) < 1e-3);

  // Test Equator, prime meridian
  const eqPos = latLonToCartesian(0, 0, 1);
  assert.ok(Math.abs(eqPos.x - 0) < 1e-6);
  assert.ok(Math.abs(eqPos.y - 0) < 1e-6);
  assert.ok(Math.abs(eqPos.z - 1) < 1e-6);
});

test('Earth dipole field generates valid field and horizontal components', () => {
  const m = getEarthDipoleMoment(0, 0); // aligned along Y (south)
  // At magnetic equator (Y = 0), field should be parallel to dipole axis (along -Y or +Y)
  const eqPos = { x: 0, y: 0, z: 1 };
  const field = calculateDipoleField(eqPos, m);

  // At equator, normal is [0, 0, 1], dipole is [0, -1, 0]
  // m . r = 0, so B = -m = [0, 1, 0]
  assert.ok(Math.abs(field.x) < 1e-6);
  assert.ok(field.y > 0, 'Field points Northwards along dipole');
  assert.ok(Math.abs(field.z) < 1e-6);

  // Compute full state at Hanoi
  const hanoiPos = latLonToCartesian(21.0285, 105.8542, 1);
  const state = computeMagneticState(hanoiPos);

  assert.ok(state.bTotalMagnitude > 0);
  assert.ok(state.bHorizontalMagnitude > 0);
  assert.equal(state.isNearPole, false);
  // Verify horizontal component is orthogonal to normal vector: B_h . n = 0
  const hDotN = dot(state.horizontalB, state.normal);
  assert.ok(Math.abs(hDotN) < 1e-6, 'B_h must be tangent to Earth surface');
});

test('handles polar singularity gracefully without NaN', () => {
  const m = { x: 0, y: -1, z: 0 };
  // At the pole itself, horizontal component vanishes
  const polePos = { x: 0, y: 1, z: 0 };
  const state = computeMagneticState(polePos, m);

  assert.ok(!Number.isNaN(state.bHorizontalMagnitude));
  assert.ok(!Number.isNaN(state.declinationDeg));
  assert.ok(!Number.isNaN(state.inclinationDeg));
  assert.ok(state.isNearPole);
});
