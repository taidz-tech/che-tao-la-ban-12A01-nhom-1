/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Globe, 
  Compass, 
  MapPin, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sliders, 
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { buildEarthMagneticSystem, EarthModelSystem } from '../three/earthModel.ts';
import { buildHandcraftedCompass, CompassModelParts } from '../three/compassModel.ts';
import { 
  computeMagneticState, 
  latLonToCartesian, 
  MagneticState 
} from '../physics/magneticField.ts';

interface LocationPreset {
  name: string;
  lat: number;
  lon: number;
  desc: string;
}

const PRESETS: LocationPreset[] = [
  { name: 'Việt Nam (Hà Nội)', lat: 21.0285, lon: 105.8542, desc: 'Khu vực Đông Nam Á, từ trường ổn định, góc từ thiên nhỏ (~-1°)' },
  { name: 'Xích Đạo (Equator)', lat: 0.0, lon: 0.0, desc: 'Từ trường nằm ngang tối đa (độ từ khuynh I ≈ 0°), lực kéo kim mạnh nhất' },
  { name: 'Gần Cực Từ Bắc', lat: 78.0, lon: -72.0, desc: 'Đường sức từ gần như thẳng đứng cắm xuống đất, Bh rất nhỏ' },
  { name: 'Châu Âu (London)', lat: 51.5074, lon: -0.1278, desc: 'Vĩ độ trung bình bắc, độ từ thiên dương nhỏ (~1°)' },
  { name: 'Nam Bán Cầu (Sydney)', lat: -33.8688, lon: 151.2093, desc: 'Bán cầu Nam, kim la bàn chỉ về cực Nam từ trường (hướng Bắc địa lý)' },
  { name: 'Bắc Mỹ (Washington D.C)', lat: 38.9072, lon: -77.0369, desc: 'Gần trục cực từ Tây Bán Cầu, góc từ thiên rõ rệt (~-10°)' },
];

export const EarthCompassSimulation: React.FC = () => {
  // Dual 3D mounts
  const earthMountRef = useRef<HTMLDivElement>(null);
  const compassMountRef = useRef<HTMLDivElement>(null);

  // Three.js instances
  const earthSystemRef = useRef<EarthModelSystem | null>(null);
  const earthControlsRef = useRef<OrbitControls | null>(null);
  const compassPartsRef = useRef<CompassModelParts | null>(null);
  const compassControlsRef = useRef<OrbitControls | null>(null);

  // Simulation State
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const [fieldLinesVisible, setFieldLinesVisible] = useState<boolean>(true);
  const [axesVisible, setAxesVisible] = useState<boolean>(true);
  const [currentLat, setCurrentLat] = useState<number>(21.0285);
  const [currentLon, setCurrentLon] = useState<number>(105.8542);
  const [magneticData, setMagneticData] = useState<MagneticState | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('Việt Nam (Hà Nội)');

  // Target needle angle for smooth spring damping
  const needleAngleRef = useRef<number>(0);
  const currentNeedleAngleRef = useRef<number>(0);

  // Setup Left 3D View (Earth)
  useEffect(() => {
    const container = earthMountRef.current;
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
    scene.fog = new THREE.FogExp2(0x020617, 0.025);

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
    controls.minDistance = 3.0;
    controls.maxDistance = 12.0;
    controls.enableZoom = false; // Allow smooth continuous page scrolling
    earthControlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(6, 6, 6);
    scene.add(sunLight);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 1.2);
    cyanRim.position.set(-6, -2, -4);
    scene.add(cyanRim);

    // Build Earth system
    const earthSystem = buildEarthMagneticSystem(1.75);
    scene.add(earthSystem.group);
    earthSystemRef.current = earthSystem;

    // Initial probe update
    const initData = earthSystem.updateProbeLocation(currentLat, currentLon);
    setMagneticData(initData);
    needleAngleRef.current = (initData.declinationDeg * Math.PI) / 180;

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // If test run is active, slowly rotate Earth around its rotational axis
      if (isPlayingTest) {
        earthSystem.group.rotation.y += delta * 0.35;
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
  }, [isPlayingTest]);

  // Setup Right 3D View (Handcrafted Compass)
  useEffect(() => {
    const container = compassMountRef.current;
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
    camera.position.set(0, 2.6, 2.2);

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
    controls.target.set(0, 0.45, 0);
    controls.minDistance = 1.4;
    controls.maxDistance = 5.5;
    controls.enableZoom = false; // Allow smooth continuous page scrolling
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    compassControlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.2, 8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // Build Compass
    const compass = buildHandcraftedCompass();
    scene.add(compass.group);
    compassPartsRef.current = compass;

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Exponential damping towards target angle calculated from physics (Bh)
      const diff = needleAngleRef.current - currentNeedleAngleRef.current;
      currentNeedleAngleRef.current += diff * (1 - Math.exp(-6.5 * delta));

      // Apply to floating system rotation
      compass.floatingSystem.rotation.y = currentNeedleAngleRef.current;
      compass.floatingSystem.position.y = 0.63 + Math.sin(elapsed * 2.5) * 0.003;

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

  // Sync probe when lat/lon changes
  const applyLocation = (lat: number, lon: number, presetName?: string) => {
    setCurrentLat(lat);
    setCurrentLon(lon);
    if (presetName) setSelectedPreset(presetName);

    if (earthSystemRef.current) {
      const state = earthSystemRef.current.updateProbeLocation(lat, lon);
      setMagneticData(state);

      // In the compass model, +Z is North (0°), +X is East (90°)
      // needle angle is the magnetic declination / azimuth offset
      needleAngleRef.current = (state.declinationDeg * Math.PI) / 180;
    }
  };

  // Toggle controls
  const handleToggleFieldLines = () => {
    const next = !fieldLinesVisible;
    setFieldLinesVisible(next);
    earthSystemRef.current?.setFieldLinesVisible(next);
  };

  const handleToggleAxes = () => {
    const next = !axesVisible;
    setAxesVisible(next);
    earthSystemRef.current?.setAxesVisible(next);
  };

  const handleReset = () => {
    setIsPlayingTest(false);
    if (earthSystemRef.current) {
      earthSystemRef.current.group.rotation.set(0, 0, 0);
    }
    applyLocation(21.0285, 105.8542, 'Việt Nam (Hà Nội)');
    earthControlsRef.current?.reset();
    compassControlsRef.current?.reset();
  };

  return (
    <div className="relative w-full min-h-[95vh] py-14 bg-slate-950 select-none flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="relative z-30 pt-8 px-4 md:px-6 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 pointer-events-none mb-4">
        <div className="bg-slate-950/85 border border-slate-800 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="text-[10px] font-mono font-bold text-sky-400 tracking-wider uppercase">
            MÔ PHỎNG VẬT LÝ ĐỊNH HƯỚNG TỪ TRƯỜNG TRÁI ĐẤT
          </div>
          <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>Liên Kết Thời Gian Thực: Trái Đất 3D &amp; La Bàn Thủ Công</span>
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 bg-slate-950/85 border border-slate-800 rounded-xl p-1.5 backdrop-blur-md shadow-lg pointer-events-auto">
          <button
            onClick={() => setIsPlayingTest(!isPlayingTest)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingTest
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
            }`}
          >
            {isPlayingTest ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingTest ? 'TẠM DỪNG' : 'CHẠY KIỂM TRA'}</span>
          </button>

          <button
            onClick={handleReset}
            title="Đặt lại góc nhìn và vị trí mặc định"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ĐẶT LẠI</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-800" />

          <button
            onClick={handleToggleFieldLines}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              fieldLinesVisible
                ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            {fieldLinesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Đường sức từ</span>
          </button>

          <button
            onClick={handleToggleAxes}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              axesVisible
                ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            {axesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Trục địa lý &amp; từ</span>
          </button>
        </div>
      </div>

      {/* Main Dual Viewport: Split Screen */}
      <div className="w-full h-[78vh] min-h-[580px] relative grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 rounded-2xl border border-slate-800/80 overflow-hidden max-w-7xl mx-auto px-0 shadow-2xl">
        {/* Left Side: 3D Earth */}
        <div className="relative w-full h-full min-h-[300px]">
          <div ref={earthMountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />
          
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-bold text-sky-400 backdrop-blur-md flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>BÊN TRÁI: QUẢ ĐỊA CẦU &amp; TỪ TRƯỜNG LƯỠNG CỰC</span>
            </div>
          </div>

          {/* Location Presets pill dock */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-1.5 pointer-events-auto">
            {PRESETS.map((p) => {
              const isSel = selectedPreset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => applyLocation(p.lat, p.lon, p.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSel
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900/80 hover:bg-slate-850 text-slate-300 border border-slate-800'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3D Handcrafted Compass */}
        <div className="relative w-full h-full min-h-[300px]">
          <div ref={compassMountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />
          
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-bold text-emerald-400 backdrop-blur-md flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>BÊN PHẢI: LA BÀN THỦ CÔNG PHẢN ỨNG THỜI GIAN THỰC</span>
            </div>
          </div>

          {/* Scientific Telemetry & Physics Metrics HUD */}
          {magneticData && (
            <div className="absolute top-14 right-4 z-10 max-w-xs w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl pointer-events-auto space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                  THÔNG SỐ ĐỊA TỪ CỤC BỘ
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Vĩ độ (φ):</div>
                  <div className="font-bold text-white">{currentLat.toFixed(2)}°</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Kinh độ (λ):</div>
                  <div className="font-bold text-white">{currentLon.toFixed(2)}°</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-sky-300 font-sans">Độ từ thiên (δ):</div>
                  <div className="font-bold text-sky-400">{magneticData.declinationDeg.toFixed(2)}°</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-amber-300 font-sans">Độ từ khuynh (I):</div>
                  <div className="font-bold text-amber-400">{magneticData.inclinationDeg.toFixed(2)}°</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Thành phần ngang <span className="font-mono text-emerald-400">B_h</span>:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {magneticData.bHorizontalMagnitude.toFixed(4)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  <span className="text-emerald-400 font-semibold">Công thức: </span>
                  <code className="text-slate-300">B_h = B - (B · n)n</code>. Thành phần ngang này sinh ra mômen ngẫu lực từ <code className="text-slate-300">τ = m × B_h</code> kéo kim la bàn chỉ về phương Bắc.
                </div>
              </div>

              {magneticData.isNearPole && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 font-medium">
                  Cảnh báo: Đang ở rất gần cực từ! Thành phần ngang B_h triệt tiêu dần, kim la bàn dao động yếu hoặc mất định hướng.
                </div>
              )}
            </div>
          )}

          {/* Quick Manual Lat/Lon Sliders Drawer */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-950/85 border border-slate-800 rounded-xl p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <span className="text-slate-400 font-mono whitespace-nowrap">Vĩ độ: {currentLat}°</span>
              <input
                type="range"
                min="-85"
                max="85"
                step="1"
                value={currentLat}
                onChange={(e) => applyLocation(Number(e.target.value), currentLon, 'Tùy chỉnh')}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <span className="text-slate-400 font-mono whitespace-nowrap">Kinh độ: {currentLon}°</span>
              <input
                type="range"
                min="-180"
                max="180"
                step="2"
                value={currentLon}
                onChange={(e) => applyLocation(currentLat, Number(e.target.value), 'Tùy chỉnh')}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
