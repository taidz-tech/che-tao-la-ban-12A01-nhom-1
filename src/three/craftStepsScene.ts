/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 3D Animated Scene for Crafting Steps:
 * Step 1: Drawing 360° waterproof coordinate disc
 * Step 2: Magnetizing needle (single direction stroke 30-40 times)
 * Step 3: Mounting needle horizontally onto floating cork
 * Step 4: Placing disc at bottom of bowl, adding water, floating needle & damped oscillation
 * Step 5: Aligning 360° disc 0° (N) with needle's red North tip
 */

import * as THREE from 'three';
import { createCompassRoseTexture, createCorkTexture } from './proceduralTextures.ts';

export interface CraftSceneHandle {
  group: THREE.Group;
  setStep: (stepNumber: number) => void;
  updateAnimation: (deltaTime: number) => void;
  playStepAnimation: () => void;
  strokeCount: number;
  isAligned: boolean;
  manualAlignAngle: number;
  setManualAlignAngle: (angleDeg: number) => void;
}

export function buildCraftStepsScene(): CraftSceneHandle {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CraftStepsScene';

  let currentStep = 1;
  let animTime = 0;
  let strokeCount = 0;
  let isAligned = false;
  let manualAlignAngle = 35; // start offset so user or auto can align it

  // Shared Materials
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.1,
  });
  const tableGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 48);
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.y = -0.05;
  tableMesh.receiveShadow = true;
  rootGroup.add(tableMesh);

  // Grid mat on table
  const gridHelper = new THREE.GridHelper(4, 20, 0x38bdf8, 0x334155);
  gridHelper.position.y = 0.002;
  rootGroup.add(gridHelper);

  // ----------------------------------------------------
  // STEP 1 GROUP: Drawing the 360° Coordinate Disc
  // ----------------------------------------------------
  const step1Group = new THREE.Group();
  step1Group.name = 'Step1Group';

  const plasticSheetGeo = new THREE.PlaneGeometry(2.2, 2.2);
  const plasticMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    transmission: 0.7,
    transparent: true,
    opacity: 0.8,
  });
  const plasticSheet = new THREE.Mesh(plasticSheetGeo, plasticMat);
  plasticSheet.rotation.x = -Math.PI / 2;
  plasticSheet.position.y = 0.01;
  step1Group.add(plasticSheet);

  // The circular disc cutout
  const discTex = createCompassRoseTexture();
  const discGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.02, 64);
  const discMat = new THREE.MeshStandardMaterial({
    map: discTex,
    roughness: 0.35,
  });
  const step1Disc = new THREE.Mesh(discGeo, discMat);
  step1Disc.position.y = 0.025;
  step1Group.add(step1Disc);

  // Waterproof Paint Marker Pen model
  const markerGroup = new THREE.Group();
  const penBodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.75, 16);
  const penBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const penBody = new THREE.Mesh(penBodyGeo, penBodyMat);
  penBody.position.y = 0.45;
  markerGroup.add(penBody);

  const penTipGeo = new THREE.ConeGeometry(0.04, 0.12, 16);
  const penTipMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const penTip = new THREE.Mesh(penTipGeo, penTipMat);
  penTip.rotation.x = Math.PI;
  penTip.position.y = 0.06;
  markerGroup.add(penTip);

  markerGroup.rotation.z = -0.35;
  markerGroup.position.set(0.65, 0.05, 0.2);
  step1Group.add(markerGroup);

  rootGroup.add(step1Group);

  // ----------------------------------------------------
  // STEP 2 GROUP: Magnetizing the Needle
  // ----------------------------------------------------
  const step2Group = new THREE.Group();
  step2Group.name = 'Step2Group';
  step2Group.visible = false;

  // Steel needle
  const needleGroup = new THREE.Group();
  needleGroup.position.set(0, 0.02, 0);

  const needleShaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.9, 16);
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
  const needleMesh = new THREE.Mesh(needleShaftGeo, steelMat);
  needleMesh.rotation.x = Math.PI / 2;
  needleGroup.add(needleMesh);

  // North tip of needle (turns red as stroking proceeds)
  const tipGeo = new THREE.ConeGeometry(0.02, 0.25, 16);
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.rotation.x = Math.PI / 2;
  tipMesh.position.z = 0.55;
  needleGroup.add(tipMesh);

  step2Group.add(needleGroup);

  // Permanent Bar Magnet (Red North pole / Blue South pole)
  const magnetGroup = new THREE.Group();
  magnetGroup.name = 'BarMagnet';

  const magHalfGeo = new THREE.BoxGeometry(0.12, 0.1, 0.25);
  const magNorthMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }); // Red N
  const magSouthMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }); // Blue S

  const magNorthMesh = new THREE.Mesh(magHalfGeo, magNorthMat);
  magNorthMesh.position.z = 0.125;
  magnetGroup.add(magNorthMesh);

  const magSouthMesh = new THREE.Mesh(magHalfGeo, magSouthMat);
  magSouthMesh.position.z = -0.125;
  magnetGroup.add(magSouthMesh);

  magnetGroup.position.set(0, 0.12, -0.45);
  step2Group.add(magnetGroup);

  // Direction arrow indicator (One-way stroke direction)
  const strokeArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0.2, 0.05, -0.45),
    0.9,
    0x10b981,
    0.15,
    0.08
  );
  step2Group.add(strokeArrow);

  rootGroup.add(step2Group);

  // ----------------------------------------------------
  // STEP 3 GROUP: Mounting Needle onto Cork
  // ----------------------------------------------------
  const step3Group = new THREE.Group();
  step3Group.name = 'Step3Group';
  step3Group.visible = false;

  const corkTex = createCorkTexture();
  const corkMat = new THREE.MeshStandardMaterial({ map: corkTex, color: 0xecd5ba, roughness: 0.85 });
  const corkGeo = new THREE.CylinderGeometry(0.25, 0.24, 0.14, 32);
  const step3Cork = new THREE.Mesh(corkGeo, corkMat);
  step3Cork.position.y = 0.07;
  step3Group.add(step3Cork);

  // Needle piercing through cork horizontally
  const step3NeedleGroup = new THREE.Group();
  step3NeedleGroup.position.y = 0.07;

  const s3NeedleMesh = new THREE.Mesh(needleShaftGeo, steelMat);
  s3NeedleMesh.rotation.x = Math.PI / 2;
  step3NeedleGroup.add(s3NeedleMesh);

  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.2 });
  const s3NorthTip = new THREE.Mesh(tipGeo, redMat);
  s3NorthTip.rotation.x = Math.PI / 2;
  s3NorthTip.position.z = 0.55;
  step3NeedleGroup.add(s3NorthTip);

  const s3SouthTip = new THREE.Mesh(tipGeo, steelMat);
  s3SouthTip.rotation.x = -Math.PI / 2;
  s3SouthTip.position.z = -0.55;
  step3NeedleGroup.add(s3SouthTip);

  step3Group.add(step3NeedleGroup);

  // Balance guide lines
  const balanceRingGeo = new THREE.RingGeometry(0.65, 0.67, 32);
  const balanceRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
  const balanceRing = new THREE.Mesh(balanceRingGeo, balanceRingMat);
  balanceRing.rotation.x = -Math.PI / 2;
  balanceRing.position.y = 0.071;
  step3Group.add(balanceRing);

  rootGroup.add(step3Group);

  // ----------------------------------------------------
  // STEP 4 & 5 GROUP: Full Assembly & Water Oscillation
  // ----------------------------------------------------
  const step4Group = new THREE.Group();
  step4Group.name = 'Step4Group';
  step4Group.visible = false;

  // Glass bowl
  const bowlPoints: THREE.Vector2[] = [];
  bowlPoints.push(new THREE.Vector2(0, 0.02));
  bowlPoints.push(new THREE.Vector2(0.9, 0.02));
  bowlPoints.push(new THREE.Vector2(0.98, 0.08));
  bowlPoints.push(new THREE.Vector2(1.15, 0.35));
  bowlPoints.push(new THREE.Vector2(1.35, 0.92));
  bowlPoints.push(new THREE.Vector2(1.36, 0.95));
  bowlPoints.push(new THREE.Vector2(1.33, 0.95));
  bowlPoints.push(new THREE.Vector2(1.3, 0.9));
  bowlPoints.push(new THREE.Vector2(1.1, 0.35));
  bowlPoints.push(new THREE.Vector2(0.92, 0.09));
  bowlPoints.push(new THREE.Vector2(0.85, 0.05));
  bowlPoints.push(new THREE.Vector2(0, 0.05));

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
  });
  const s4BowlGeo = new THREE.LatheGeometry(bowlPoints, 48);
  const s4Bowl = new THREE.Mesh(s4BowlGeo, glassMat);
  step4Group.add(s4Bowl);

  // Water
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.04,
    transmission: 0.75,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const s4Water = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 0.88, 0.58, 48), waterMat);
  s4Water.position.y = 0.34;
  step4Group.add(s4Water);

  // Coordinate Disc at bottom
  const s4Disc = new THREE.Mesh(discGeo, discMat);
  s4Disc.position.y = 0.055;
  step4Group.add(s4Disc);

  // Floating needle + cork
  const s4Floating = new THREE.Group();
  s4Floating.position.y = 0.63;

  const s4Cork = new THREE.Mesh(corkGeo, corkMat);
  s4Cork.position.y = 0.03;
  s4Floating.add(s4Cork);

  const s4Needle = new THREE.Group();
  s4Needle.position.y = 0.09;
  s4Needle.add(new THREE.Mesh(needleShaftGeo, steelMat));

  const s4NorthTip = new THREE.Mesh(tipGeo, redMat);
  s4NorthTip.rotation.x = Math.PI / 2;
  s4NorthTip.position.z = 0.55;
  s4Needle.add(s4NorthTip);

  const s4SouthTip = new THREE.Mesh(tipGeo, steelMat);
  s4SouthTip.rotation.x = -Math.PI / 2;
  s4SouthTip.position.z = -0.55;
  s4Needle.add(s4SouthTip);

  s4Floating.add(s4Needle);
  step4Group.add(s4Floating);

  rootGroup.add(step4Group);

  // ----------------------------------------------------
  // Update and Step Control Logic
  // ----------------------------------------------------
  const setStep = (stepNumber: number) => {
    currentStep = stepNumber;
    animTime = 0;
    step1Group.visible = currentStep === 1;
    step2Group.visible = currentStep === 2;
    step3Group.visible = currentStep === 3;
    step4Group.visible = currentStep === 4 || currentStep === 5;

    if (currentStep === 2) {
      strokeCount = 0;
      tipMat.color.setHex(0x94a3b8);
    }
  };

  const playStepAnimation = () => {
    animTime = 0;
    if (currentStep === 2) {
      strokeCount = 0;
      tipMat.color.setHex(0x94a3b8);
    }
  };

  const setManualAlignAngle = (angleDeg: number) => {
    manualAlignAngle = angleDeg;
  };

  const updateAnimation = (deltaTime: number) => {
    animTime += deltaTime;

    // STEP 1: Pen drawing circle and compass lines
    if (currentStep === 1) {
      const penAngle = animTime * 1.5;
      const r = 0.65;
      markerGroup.position.x = r * Math.cos(penAngle);
      markerGroup.position.z = r * Math.sin(penAngle);
      markerGroup.position.y = 0.05 + Math.sin(animTime * 6) * 0.01;
    }

    // STEP 2: Magnet stroking needle in ONE direction
    if (currentStep === 2) {
      const strokePeriod = 0.9; // seconds per stroke
      const phase = (animTime % strokePeriod) / strokePeriod;

      if (phase < 0.75) {
        // Forward stroke: from needle base (-0.45) to needle tip (+0.5)
        const t = phase / 0.75;
        magnetGroup.position.z = -0.45 + t * 0.95;
        magnetGroup.position.y = 0.08 + Math.sin(t * Math.PI) * 0.02;
      } else {
        // Lift off and return to start
        const t = (phase - 0.75) / 0.25;
        magnetGroup.position.z = 0.5 - t * 0.95;
        magnetGroup.position.y = 0.25; // lifted up
      }

      // Calculate stroke count up to 35
      const calculatedStrokes = Math.min(35, Math.floor(animTime / strokePeriod) + 1);
      if (calculatedStrokes !== strokeCount) {
        strokeCount = calculatedStrokes;
        // Progressively color tip red
        const redRatio = Math.min(1, strokeCount / 30);
        tipMat.color.setRGB(
          0.58 + redRatio * 0.28,
          0.64 - redRatio * 0.49,
          0.72 - redRatio * 0.57
        );
      }
    }

    // STEP 3: Mounting needle
    if (currentStep === 3) {
      // Gentle floating levitation to highlight mounting
      const hover = Math.sin(animTime * 2) * 0.02;
      step3Cork.position.y = 0.07 + hover;
      step3NeedleGroup.position.y = 0.07 + hover;
    }

    // STEP 4: Damped oscillation of floating needle
    if (currentStep === 4) {
      // Harmonic damped oscillation formula: theta(t) = theta_0 * exp(-gamma * t) * cos(omega * t)
      const omega = 3.2; // angular frequency
      const gamma = 0.35; // damping coefficient
      const initialOffset = 1.3; // radians (~75 deg)
      const currentAngle = initialOffset * Math.exp(-gamma * animTime) * Math.cos(omega * animTime);
      s4Floating.rotation.y = currentAngle;

      // Disc aligned at base orientation (-PI/2)
      s4Disc.rotation.y = -Math.PI / 2;
    }

    // STEP 5: Aligning 360° disc with needle
    if (currentStep === 5) {
      // Needle has settled at 0 (North)
      s4Floating.rotation.y = 0;

      // Apply manual or animated alignment angle offset from base (-PI/2)
      const discRad = (manualAlignAngle * Math.PI) / 180;
      s4Disc.rotation.y = -Math.PI / 2 + discRad;

      // Check if aligned (within 2 degrees of 0)
      isAligned = Math.abs(manualAlignAngle) < 2;
    }
  };

  return {
    group: rootGroup,
    setStep,
    updateAnimation,
    playStepAnimation,
    get strokeCount() {
      return strokeCount;
    },
    get isAligned() {
      return isAligned;
    },
    get manualAlignAngle() {
      return manualAlignAngle;
    },
    setManualAlignAngle,
  };
}
