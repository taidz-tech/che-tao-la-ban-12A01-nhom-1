/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Compass, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { buildCraftStepsScene, CraftSceneHandle } from '../three/craftStepsScene.ts';

interface StepDetail {
  number: number;
  title: string;
  objective: string;
  guide: string[];
  warning?: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

const STEPS_DATA: StepDetail[] = [
  {
    number: 1,
    title: 'VẼ ĐĨA TỌA ĐỘ 360° CHỐNG THẤM NƯỚC',
    objective: 'Chế tạo mặt đĩa chia độ chính xác, không bị nhòe mực khi ngâm đáy bát nước.',
    guide: [
      'Cắt tấm nhựa PVC mỏng hoặc bìa nhựa trong thành hình tròn vừa khít với đáy bát nước.',
      'Dùng thước đo độ đánh dấu 8 hướng chính: N (0°/360°), NE (45°), E (90°), SE (135°), S (180°), SW (225°), W (270°), NW (315°).',
      'Chia các vạch độ đều đặn cách nhau mỗi 5° hoặc 10° quanh đường tròn.',
      'Sử dụng bút lông dầu sơn (Paint Marker) hoặc bút lông vĩnh cửu. Nếu dùng giấy in, bắt buộc ép nhựa dẻo (Plastify) hoặc dán kín băng keo trong 2 mặt.',
    ],
    cameraPos: [0, 2.4, 0.05],
    targetPos: [0, 0, 0],
  },
  {
    number: 2,
    title: 'NHIỄM TỪ CHO KIM (TỪ HÓA)',
    objective: 'Biến kim sắt thông thường thành một nam châm nhỏ có mômen từ m.',
    guide: [
      'Đặt kim khâu phẳng trên bàn. Dùng một cực của nam châm vĩnh cửu (thanh nam châm) áp vào thân kim.',
      'Vuốt dọc theo thân kim theo một chiều duy nhất từ gốc kim (lỗ xỏ chỉ) ra đến mũi kim.',
      'Nhấc nam châm lên khỏi kim, đưa về vị trí ban đầu và lặp lại thao tác vuốt khoảng 30–40 lần.',
      'Sau khi nhiễm từ, kiểm tra đầu Bắc và đánh dấu bằng sơn đỏ ở đầu mũi kim.',
    ],
    warning: 'CẢNH BÁO QUAN TRỌNG: Không vuốt qua vuốt lại hai chiều vì các đômen từ tính sẽ triệt tiêu lẫn nhau, làm kim mất từ tính!',
    cameraPos: [0.8, 1.3, 1.2],
    targetPos: [0, 0.05, 0],
  },
  {
    number: 3,
    title: 'GẮN KIM LÊN VẬT NỔI',
    objective: 'Tạo hệ cân bằng cơ học phương ngang trên bề mặt chất lỏng.',
    guide: [
      'Cắt một lát mỏng từ nút chai rượu vang hoặc miếng xốp tròn có độ dày khoảng 3–5 mm.',
      'Khéo léo xiên thân kim qua tâm miếng xốp/nút chai sao cho kim nằm thăng bằng theo phương ngang.',
      'Trọng tâm của hệ kim + vật nổi phải nằm thấp và đối xứng để khi thả vào nước kim không bị chao đảo hoặc nghiêng chúi đầu.',
    ],
    cameraPos: [0.9, 1.1, 0.9],
    targetPos: [0, 0.1, 0],
  },
  {
    number: 4,
    title: 'LẮP RÁP & THẢ VÀO BÁT NƯỚC',
    objective: 'Giải phóng ma sát cơ học, để kim tự do dao động định hướng theo từ trường Trái Đất.',
    guide: [
      'Đặt đĩa tọa độ 360° đã chuẩn bị xuống đáy bát thủy tinh (có thể dán băng dính 2 mặt để đĩa cố định ở đáy).',
      'Đổ nước từ từ vào bát cho đến khoảng 2/3 thể tích.',
      'Nhẹ nhàng đặt miếng xốp mang kim nổi lên mặt nước giữa bát. Tránh để miếng xốp dính vào thành bát do sức căng bề mặt.',
      'Quan sát hệ kim tự do quay dao động tắt dần và từ từ dừng lại dọc theo trục Bắc – Nam địa từ.',
    ],
    cameraPos: [1.8, 1.4, 1.6],
    targetPos: [0, 0.4, 0],
  },
  {
    number: 5,
    title: 'CĂN CHỈNH ĐĨA TỌA ĐỘ THEO HƯỚNG BẮC',
    objective: 'Đồng bộ hóa mốc 0° (N) của đĩa tọa độ với đầu Bắc của kim để đọc chính xác góc phương vị.',
    guide: [
      'Chờ kim ổn định hoàn toàn theo phương Bắc – Nam.',
      'Xác định đầu Bắc thật sự (so sánh với hướng Mặt Trời mọc/lặn hoặc la bàn điện thoại).',
      'Giữ yên bát nước, xoay nhẹ đĩa tọa độ dưới đáy bát sao cho vạch 0° (kí hiệu N) trùng khít với phương của đầu Bắc kim la bàn (đầu sơn đỏ).',
      'Lúc này toàn bộ hệ thống đã sẵn sàng: các hướng Đông (90°), Nam (180°), Tây (270°) và các góc phương vị khác được xác định chính xác.',
    ],
    cameraPos: [0.2, 2.2, 0.6],
    targetPos: [0, 0.35, 0],
  },
];

interface CraftingStepsViewProps {
  onGoToSimulation: () => void;
}

export const CraftingStepsView: React.FC<CraftingStepsViewProps> = ({ onGoToSimulation }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const craftHandleRef = useRef<CraftSceneHandle | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [strokeDisplayCount, setStrokeDisplayCount] = useState<number>(0);
  const [manualAngle, setManualAngle] = useState<number>(35);
  const [isAligned, setIsAligned] = useState<boolean>(false);

  const step = STEPS_DATA[currentStepIndex];

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
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...step.cameraPos);
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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(...step.targetPos);
    controls.maxDistance = 5.0;
    controls.minDistance = 0.8;
    controls.enableZoom = false; // Allow smooth continuous page scrolling
    controlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(3, 6, 4);
    scene.add(dirLight);

    const blueFill = new THREE.PointLight(0x38bdf8, 1.2, 10);
    blueFill.position.set(-3, 2, -2);
    scene.add(blueFill);

    // Build the craft steps 3D model
    const craft = buildCraftStepsScene();
    scene.add(craft.group);
    craftHandleRef.current = craft;
    craft.setStep(step.number);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      craft.updateAnimation(delta);

      if (step.number === 2) {
        setStrokeDisplayCount(craft.strokeCount);
      } else if (step.number === 5) {
        setIsAligned(craft.isAligned);
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
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update step transition
  const goToStep = (index: number) => {
    if (index < 0 || index >= STEPS_DATA.length) return;
    setCurrentStepIndex(index);
    const targetStep = STEPS_DATA[index];

    if (craftHandleRef.current) {
      craftHandleRef.current.setStep(targetStep.number);
      if (targetStep.number === 5) {
        craftHandleRef.current.setManualAlignAngle(manualAngle);
      }
    }

    // Move camera
    if (cameraRef.current && controlsRef.current) {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      const startPos = cam.position.clone();
      const endPos = new THREE.Vector3(...targetStep.cameraPos);
      const startTarget = ctrl.target.clone();
      const endTarget = new THREE.Vector3(...targetStep.targetPos);

      let progress = 0;
      const duration = 650;
      const startTime = performance.now();

      const stepAnim = (now: number) => {
        progress = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        cam.position.lerpVectors(startPos, endPos, ease);
        ctrl.target.lerpVectors(startTarget, endTarget, ease);
        ctrl.update();

        if (progress < 1) {
          requestAnimationFrame(stepAnim);
        }
      };

      requestAnimationFrame(stepAnim);
    }
  };

  const handleReplay = () => {
    if (craftHandleRef.current) {
      craftHandleRef.current.playStepAnimation();
    }
  };

  const handleAngleChange = (angle: number) => {
    setManualAngle(angle);
    if (craftHandleRef.current) {
      craftHandleRef.current.setManualAlignAngle(angle);
      setIsAligned(Math.abs(angle) < 2);
    }
  };

  return (
    <div className="relative w-full h-[95vh] min-h-[640px] bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Step Progress Pills Header */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-4xl">
        <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-2 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-1">
          {STEPS_DATA.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.number}
                onClick={() => goToStep(idx)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 md:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                    : isCompleted
                    ? 'bg-slate-900/90 text-emerald-400 hover:bg-slate-850 border border-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px] font-mono">
                  {s.number}
                </span>
                <span className="hidden sm:inline line-clamp-1 text-[11px]">
                  {s.number === 1 && 'Vẽ đĩa 360°'}
                  {s.number === 2 && 'Nhiễm từ kim'}
                  {s.number === 3 && 'Gắn vật nổi'}
                  {s.number === 4 && 'Lắp ráp bát'}
                  {s.number === 5 && 'Căn chỉnh 0°'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Left Instructional Floating Card */}
      <div className="absolute top-32 left-6 z-20 max-w-md w-full pointer-events-none">
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">
              QUY TRÌNH THỰC HÀNH • BƯỚC {step.number}/5
            </span>
            <button
              onClick={handleReplay}
              title="Phát lại hoạt ảnh mô phỏng thao tác"
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Phát lại</span>
            </button>
          </div>

          <h3 className="text-base md:text-lg font-bold text-white mb-2 leading-snug">
            {step.title}
          </h3>

          <p className="text-xs text-sky-300 bg-sky-950/40 border border-sky-800/40 rounded-lg p-2 mb-3 leading-relaxed">
            <span className="font-semibold">Mục đích: </span>
            {step.objective}
          </p>

          {/* Step 2 specific counter */}
          {step.number === 2 && (
            <div className="mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Số lần vuốt nam châm:</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {strokeDisplayCount} <span className="text-xs text-slate-500">/ 35 lần</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Trạng thái từ hóa:</div>
                <div className="text-xs font-semibold text-sky-300">
                  {strokeDisplayCount >= 30 ? 'Đã nhiễm từ hoàn chỉnh' : 'Đang từ hóa các đômen'}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 Alignment Tool */}
          {step.number === 5 && (
            <div className="mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Góc xoay đĩa tọa độ:</span>
                <span className="font-mono text-sky-400 font-bold">{manualAngle}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={manualAngle}
                onChange={(e) => handleAngleChange(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleAngleChange(0)}
                  className="text-xs px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium cursor-pointer"
                >
                  Căn chuẩn 0° (N)
                </button>
                {isAligned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ĐÃ CĂN CHỈNH HƯỚNG BẮC
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-medium">Chưa trùng khớp 0°</span>
                )}
              </div>
            </div>
          )}

          {/* Guide list */}
          <ul className="space-y-1.5 text-xs text-slate-300 mb-3 max-h-48 overflow-y-auto pr-1">
            {step.guide.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sky-400 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          {/* Warning */}
          {step.warning && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-tight">{step.warning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Dock Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-2xl">
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
          <button
            onClick={() => goToStep(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Bước trước</span>
          </button>

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            BƯỚC {step.number} / {STEPS_DATA.length}
          </div>

          {currentStepIndex < STEPS_DATA.length - 1 ? (
            <button
              onClick={() => goToStep(currentStepIndex + 1)}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <span>Bước tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onGoToSimulation}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Chuyển Sang Mô Phỏng Trái Đất</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
