/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Eye, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Droplet, 
  Layers, 
  Disc, 
  X, 
  ChevronRight,
  Maximize,
  Info
} from 'lucide-react';
import { buildHandcraftedCompass, CompassModelParts } from '../three/compassModel.ts';

interface CompassExplorerProps {
  onGoToSteps: () => void;
}

interface PartInfo {
  id: string;
  name: string;
  role: string;
  physics: string;
  materials: string;
  icon: React.ReactNode;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

const PARTS_DATA: PartInfo[] = [
  {
    id: 'needle',
    name: 'Kim Từ Tính (Magnetized Needle)',
    role: 'Bộ phận cảm ứng và định hướng từ trường Trái Đất',
    physics:
      'Được nhiễm từ bằng nam châm vĩnh cửu tạo mômen từ m. Dưới tác dụng của từ trường Trái Đất B, kim chịu mômen lực τ = m × B xoay về phương Bắc – Nam. Đầu Bắc được sơn màu đỏ để dễ nhận biết.',
    materials: 'Kim khâu thép (dài 3–5 cm), sơn móng tay / sơn dầu đỏ ở đầu Bắc.',
    icon: <Compass className="w-4 h-4 text-rose-400" />,
    cameraPos: [0, 1.4, 1.2],
    targetPos: [0, 0.65, 0],
  },
  {
    id: 'cork',
    name: 'Vật Liệu Nổi (Miếng Xốp / Nút Chai)',
    role: 'Nâng đỡ kim và triệt tiêu ma sát tiếp xúc',
    physics:
      'Lực đẩy Ác-si-mét cân bằng với trọng lực của hệ (P = F_A), giữ kim nằm thăng bằng theo phương ngang trên mặt thoáng chất lỏng, giảm lực cản ma sát quay đến mức tối thiểu.',
    materials: 'Miếng xốp nhỏ hoặc nút chai rượu vang cắt mỏng (dày ~5mm).',
    icon: <Layers className="w-4 h-4 text-amber-400" />,
    cameraPos: [0.6, 1.1, 0.9],
    targetPos: [0, 0.63, 0],
  },
  {
    id: 'water',
    name: 'Bát Đựng & Nước (Liquid Medium)',
    role: 'Môi trường chất lỏng tự do phi từ tính',
    physics:
      'Nước tạo môi trường tự do cho vật nổi. Bát làm bằng thủy tinh, nhựa hoặc sứ (vật liệu nghịch từ / thuận từ yếu), tuyệt đối không dùng sắt thép để tránh làm biến dạng đường sức từ xung quanh.',
    materials: 'Bát thủy tinh trong suốt, nước sạch nhiệt độ phòng.',
    icon: <Droplet className="w-4 h-4 text-sky-400" />,
    cameraPos: [1.8, 1.3, 1.5],
    targetPos: [0, 0.4, 0],
  },
  {
    id: 'disk',
    name: 'Đĩa Tọa Độ 360° (Compass Rose)',
    role: 'Thang đo góc phương vị chính xác 0°–360°',
    physics:
      'Chia 8 hướng chính phụ (N, NE, E, SE, S, SW, W, NW) và 360 vạch độ. Đặt chìm dưới đáy bát, được xoay để vạch 0° (N) trùng với phương đầu Bắc kim la bàn để xác định các phương vị khác.',
    materials: 'Tấm nhựa PVC mỏng / bìa trong dẻo, bút sơn dầu chống thấm nước.',
    icon: <Disc className="w-4 h-4 text-indigo-400" />,
    cameraPos: [0, 2.3, 0.05],
    targetPos: [0, 0.05, 0],
  },
];

export const CompassExplorer: React.FC<CompassExplorerProps> = ({ onGoToSteps }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const compassPartsRef = useRef<CompassModelParts | null>(null);

  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'top' | 'side' | 'custom'>('overview');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

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
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.4, 2.2, 2.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.45, 0);
    controls.maxDistance = 6.5;
    controls.minDistance = 1.0;
    controls.enableZoom = false; // Do not trap mouse wheel, allowing smooth webpage scroll
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Build the Handcrafted Compass Model
    const compass = buildHandcraftedCompass();
    scene.add(compass.group);
    compassPartsRef.current = compass;

    // Raycaster for clicking directly on 3D parts
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(compass.raycastTargets, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.partId) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.partId) {
          const match = PARTS_DATA.find((p) => p.id === obj?.userData.partId);
          if (match) {
            handleSelectPart(match);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle water wave float on needle
      compass.floatingSystem.position.y = 0.63 + Math.sin(elapsed * 2.2) * 0.005;
      compass.floatingSystem.rotation.y = Math.sin(elapsed * 0.7) * 0.04;

      if (autoRotate && !selectedPart) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.75;
      } else {
        controls.autoRotate = false;
      }

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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Smooth camera position transitions
  const moveCameraTo = (pos: [number, number, number], target: [number, number, number]) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    const startPos = cam.position.clone();
    const endPos = new THREE.Vector3(...pos);
    const startTarget = ctrl.target.clone();
    const endTarget = new THREE.Vector3(...target);

    let progress = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      cam.position.lerpVectors(startPos, endPos, ease);
      ctrl.target.lerpVectors(startTarget, endTarget, ease);
      ctrl.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleSelectPart = (part: PartInfo) => {
    setSelectedPart(part);
    setAutoRotate(false);
    moveCameraTo(part.cameraPos, part.targetPos);
  };

  const handleDeselectPart = () => {
    setSelectedPart(null);
    setCameraPreset('overview');
    moveCameraTo([2.4, 2.2, 2.6], [0, 0.45, 0]);
  };

  // Camera presets
  const applyPreset = (preset: 'overview' | 'top' | 'side' | 'reset') => {
    setSelectedPart(null);
    if (preset === 'overview' || preset === 'reset') {
      setCameraPreset('overview');
      moveCameraTo([2.4, 2.2, 2.6], [0, 0.45, 0]);
    } else if (preset === 'top') {
      setCameraPreset('top');
      moveCameraTo([0, 3.2, 0.05], [0, 0.45, 0]);
    } else if (preset === 'side') {
      setCameraPreset('side');
      moveCameraTo([3.1, 0.55, 0], [0, 0.45, 0]);
    }
  };

  return (
    <div className="relative w-full h-[95vh] min-h-[640px] bg-slate-950 select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Information Tag */}
      <div className="absolute top-16 left-6 z-20 pointer-events-none">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-lg">
          <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">
            KHÁM PHÁ CẤU TẠO 3D CHI TIẾT
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span>Bộ La Bàn Thủ Công Hoàn Chỉnh</span>
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Nhấp trực tiếp vào từng bộ phận trên mô hình 3D để xem thông số
          </div>
        </div>
      </div>

      {/* Part Inspection Overlay Modal (When a part is clicked) */}
      {selectedPart && (
        <div className="absolute top-16 right-6 z-30 max-w-sm w-full bg-slate-950/90 border border-sky-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                {selectedPart.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400">CHI TIẾT CẤU TẠO</span>
                <h3 className="text-sm font-bold text-white">{selectedPart.name}</h3>
              </div>
            </div>
            <button
              onClick={handleDeselectPart}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-slate-300 mb-0.5">Chức năng &amp; Vai trò:</div>
              <div className="text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {selectedPart.role}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-sky-300 mb-0.5">Cơ sở vật lý &amp; Định luật:</div>
              <div className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {selectedPart.physics}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-amber-300 mb-0.5">Vật liệu thực tế đề xuất:</div>
              <div className="text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {selectedPart.materials}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleDeselectPart}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              ← Quay lại góc nhìn bao quát
            </button>
            <button
              onClick={onGoToSteps}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Xem bước chế tạo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Part selector chip bar (Top-Center / Below nav) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-full backdrop-blur-md">
        {PARTS_DATA.map((part) => {
          const isSelected = selectedPart?.id === part.id;
          return (
            <button
              key={part.id}
              onClick={() => handleSelectPart(part)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {part.icon}
              <span>{part.name.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Consolidated Bottom Dock (Per Three.js Guidelines: zero mid-viewport clutter) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-3xl">
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3 md:p-3.5 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">GÓC QUAN SÁT:</span>
            <button
              onClick={() => applyPreset('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                cameraPreset === 'overview'
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              GÓC NHÌN TỔNG QUAN
            </button>

            <button
              onClick={() => applyPreset('top')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                cameraPreset === 'top'
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              NHÌN TỪ TRÊN (TOP)
            </button>

            <button
              onClick={() => applyPreset('side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                cameraPreset === 'side'
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              NHÌN TỪ BÊN (SIDE)
            </button>

            <button
              onClick={() => applyPreset('reset')}
              title="Khôi phục góc nhìn mặc định"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              <button
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.multiplyScalar(0.88);
                  }
                }}
                title="Phóng to (Zoom In)"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-sky-400 border border-slate-800 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.multiplyScalar(1.14);
                  }
                }}
                title="Thu nhỏ (Zoom Out)"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-sky-400 border border-slate-800 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls: Auto Rotate & Next Step */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                autoRotate
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tự Động Xoay: {autoRotate ? 'BẬT' : 'TẮT'}
            </button>

            <button
              onClick={onGoToSteps}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Xem 5 Bước Chế Tạo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
