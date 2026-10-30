/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowRight, Compass, CompassIcon, Shield, Layers, HelpCircle } from 'lucide-react';
import { buildEarthMagneticSystem } from '../three/earthModel.ts';
import { buildHandcraftedCompass } from '../three/compassModel.ts';

interface HeroLandingProps {
  onStartExploring: () => void;
  onGoToSim: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartExploring,
  onGoToSim,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false; // Allow mouse wheel to scroll down the webpage effortlessly
    controls.maxPolarAngle = Math.PI / 2 + 0.15;

    // Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    const blueFillLight = new THREE.PointLight(0x0284c7, 1.8, 15);
    blueFillLight.position.set(-5, -2, -3);
    scene.add(blueFillLight);

    // 1. Earth with magnetic field lines at background/left
    const earthSystem = buildEarthMagneticSystem(1.7);
    earthSystem.group.position.set(-1.8, 0.4, -0.6);
    scene.add(earthSystem.group);

    // 2. Handcrafted Compass in foreground/right
    const compassSystem = buildHandcraftedCompass();
    compassSystem.group.position.set(1.9, -0.4, 0.5);
    compassSystem.group.scale.set(0.95, 0.95, 0.95);
    scene.add(compassSystem.group);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slowly rotate Earth
      earthSystem.globeMesh.rotation.y += delta * 0.15;

      // Gentle floating needle wave animation on compass
      compassSystem.floatingSystem.rotation.y = Math.sin(elapsed * 0.8) * 0.06;
      compassSystem.floatingSystem.position.y = 0.63 + Math.sin(elapsed * 2) * 0.008;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[100vh] overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* 3D Canvas Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Star Grid Background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950/60 to-slate-950"
      />

      {/* Top Banner space padding */}
      <div className="pt-20 px-6 max-w-7xl mx-auto w-full z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-400 text-xs font-semibold backdrop-blur-md">
          <Shield className="w-3.5 h-3.5" />
          <span>BÀI BÁO CÁO KHOA HỌC GDQP-AN</span>
        </div>
      </div>

      {/* Central Content Card (Left-aligned, zero clutter) */}
      <div className="relative z-10 px-6 max-w-7xl mx-auto w-full my-auto pointer-events-none">
        <div className="max-w-2xl bg-slate-950/75 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 tracking-wider mb-2">
            <span>ĐỊA TỪ HỌC &amp; ĐỊNH VỊ QUÂN SỰ</span>
            <span>•</span>
            <span>VẬT LÝ THỰC NGHIỆM</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            CHẾ TẠO LA BÀN THỦ CÔNG
          </h1>

          <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed mb-6">
            Khám phá từ trường Trái Đất và nguyên lý xác định phương hướng.
          </p>

          {/* Quick Technical Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Đĩa Tọa Độ 360°</div>
                <div className="text-[11px] text-slate-400">Nhựa chống thấm nước, 8 hướng chính phụ</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <CompassIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Kim Nhiễm Từ</div>
                <div className="text-[11px] text-slate-400">Nổi tự do trên nước, ma sát xoay cực tiểu</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Từ Trường Trái Đất</div>
                <div className="text-[11px] text-slate-400">Momen ngẫu lực từ: <span className="font-mono">τ = m × B</span></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStartExploring}
              className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm md:text-base flex items-center gap-2.5 shadow-lg shadow-sky-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <span>BẮT ĐẦU KHÁM PHÁ</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onGoToSim}
              className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Mô Phỏng Trái Đất &amp; La Bàn
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint & Scroll Down Indicator */}
      <div className="relative z-10 pb-6 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 pointer-events-none">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Kéo chuột để xoay 3D • Cuộn chuột để xem toàn bộ bài thuyết trình</span>
        </div>

        {/* Clickable Animated Scroll Down Pill */}
        <button
          onClick={onStartExploring}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 text-sky-400 hover:text-white font-semibold text-xs shadow-lg transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
        >
          <span>Cuộn xuống xem nội dung</span>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
        </button>

        <div className="font-mono text-[11px] text-slate-500 hidden sm:block pointer-events-none">
          TIÊU CHUẨN KỸ THUẬT: VẬT TƯ CHỐNG THẤM &amp; ĐỊNH VỊ 0°–360°
        </div>
      </div>
    </div>
  );
};
