import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, Eye, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import type { OrganTwinStatus, TelemetryVitals } from '../../types/clinical.js';

interface DigitalTwin3DProps {
  vitals: TelemetryVitals;
  organs: OrganTwinStatus[];
  selectedOrganId: string | null;
  onSelectOrgan: (id: string | null) => void;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  vitals,
  organs,
  selectedOrganId,
  onSelectOrgan,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const selectedOrganRef = useRef(selectedOrganId);
  const vitalsRef = useRef(vitals);
  const organsRef = useRef(organs);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    selectedOrganRef.current = selectedOrganId;
  }, [selectedOrganId]);

  useEffect(() => {
    vitalsRef.current = vitals;
  }, [vitals]);

  useEffect(() => {
    organsRef.current = organs;
  }, [organs]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Headless / ultra mode detection for optimized rendering
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x030712, 0.95);
    container.appendChild(renderer.domElement);

    // Subtle Ambient and Directional Cyber Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    topLight.position.set(2, 5, 4);
    scene.add(topLight);

    const backRimLight = new THREE.DirectionalLight(0x3b82f6, 1.0);
    backRimLight.position.set(-3, -2, -4);
    scene.add(backRimLight);

    // Root Group for Twin Mesh
    const twinGroup = new THREE.Group();
    scene.add(twinGroup);

    // 1. Futuristic Holographic Torso Silhouette (Translucent Wireframe Glass)
    const torsoGeo = new THREE.CylinderGeometry(0.9, 0.7, 3.2, 16, 12, true);
    const torsoMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = -0.1;
    twinGroup.add(torsoMesh);

    // Head wireframe
    const headGeo = new THREE.SphereGeometry(0.55, 14, 10);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 2.1;
    twinGroup.add(headMesh);

    // Shoulders & Pelvis rings
    const shoulderGeo = new THREE.TorusGeometry(1.3, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.35 });
    const shoulderMesh = new THREE.Mesh(shoulderGeo, ringMat);
    shoulderMesh.rotation.x = Math.PI / 2;
    shoulderMesh.position.y = 1.35;
    twinGroup.add(shoulderMesh);

    // Vascular Central Trunk (Aorta & Vena Cava glowing lines)
    const aortaPoints = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(-0.05, 0.6, 0.1),
      new THREE.Vector3(0.04, 0.1, 0.05),
      new THREE.Vector3(0, -0.7, 0.02),
      new THREE.Vector3(-0.25, -1.5, 0),
    ];
    const aortaGeo = new THREE.BufferGeometry().setFromPoints(aortaPoints);
    const aortaMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2, transparent: true, opacity: 0.7 });
    const aortaLine = new THREE.Line(aortaGeo, aortaMat);
    twinGroup.add(aortaLine);

    // 2. Interactive Organ Meshes
    const organMeshes: { [key: string]: THREE.Mesh } = {};
    const organGroups: { [key: string]: THREE.Group } = {};

    const stressColorMap = {
      normal: 0x10b981, // Emerald green
      compensated: 0x06b6d4, // Cyan
      failing: 0xf59e0b, // Amber
      critical: 0xef4444, // Red
    };

    // Helper to get color for organ
    const getOrganColor = (id: string) => {
      const org = organsRef.current.find((o) => o.id === id);
      if (!org) return 0x06b6d4;
      return stressColorMap[org.stressLevel] || 0x06b6d4;
    };

    // Brain (Head center)
    const brainGroup = new THREE.Group();
    brainGroup.position.set(0, 2.1, 0);
    const brainGeo = new THREE.IcosahedronGeometry(0.38, 2);
    const brainMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('brain'),
      roughness: 0.3,
      metalness: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainMesh.userData = { organId: 'brain' };
    brainGroup.add(brainMesh);
    twinGroup.add(brainGroup);
    organMeshes['brain'] = brainMesh;
    organGroups['brain'] = brainGroup;

    // Heart (Left thorax)
    const heartGroup = new THREE.Group();
    heartGroup.position.set(-0.24, 0.7, 0.3);
    const heartGeo = new THREE.DodecahedronGeometry(0.32, 1);
    const heartMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('heart'),
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.9,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.userData = { organId: 'heart' };
    heartGroup.add(heartMesh);
    twinGroup.add(heartGroup);
    organMeshes['heart'] = heartMesh;
    organGroups['heart'] = heartGroup;

    // Lungs (Bilateral Thorax)
    const lungsGroup = new THREE.Group();
    lungsGroup.position.set(0, 0.75, 0.1);
    const lungGeo = new THREE.CapsuleGeometry(0.28, 0.55, 6, 12);

    const rightLungMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('lungs'),
      roughness: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const rightLung = new THREE.Mesh(lungGeo, rightLungMat);
    rightLung.position.set(0.48, 0, 0);
    rightLung.userData = { organId: 'lungs' };
    lungsGroup.add(rightLung);

    const leftLungMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('lungs'),
      roughness: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const leftLung = new THREE.Mesh(lungGeo, leftLungMat);
    leftLung.position.set(-0.48, 0, 0);
    leftLung.userData = { organId: 'lungs' };
    lungsGroup.add(leftLung);
    twinGroup.add(lungsGroup);
    organMeshes['lungs'] = rightLung;
    organGroups['lungs'] = lungsGroup;

    // Kidneys (Bilateral retroperitoneal lower)
    const kidneysGroup = new THREE.Group();
    kidneysGroup.position.set(0, -0.3, -0.15);
    const kidneyGeo = new THREE.SphereGeometry(0.2, 12, 8);
    kidneyGeo.scale(1, 1.4, 0.8);

    const rightKidneyMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('kidneys'),
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const rightKidney = new THREE.Mesh(kidneyGeo, rightKidneyMat);
    rightKidney.position.set(0.42, 0, 0);
    rightKidney.userData = { organId: 'kidneys' };
    kidneysGroup.add(rightKidney);

    const leftKidneyMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('kidneys'),
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const leftKidney = new THREE.Mesh(kidneyGeo, leftKidneyMat);
    leftKidney.position.set(-0.42, 0, 0);
    leftKidney.userData = { organId: 'kidneys' };
    kidneysGroup.add(leftKidney);
    twinGroup.add(kidneysGroup);
    organMeshes['kidneys'] = rightKidney;
    organGroups['kidneys'] = kidneysGroup;

    // Liver (Right Upper Quadrant)
    const liverGroup = new THREE.Group();
    liverGroup.position.set(0.35, 0.15, 0.22);
    const liverGeo = new THREE.ConeGeometry(0.42, 0.65, 8);
    liverGeo.rotateZ(Math.PI / 3);
    const liverMat = new THREE.MeshStandardMaterial({
      color: getOrganColor('liver'),
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const liverMesh = new THREE.Mesh(liverGeo, liverMat);
    liverMesh.userData = { organId: 'liver' };
    liverGroup.add(liverMesh);
    twinGroup.add(liverGroup);
    organMeshes['liver'] = liverMesh;
    organGroups['liver'] = liverGroup;

    // Microvascular Network Indicator (Lower systemic ring)
    const vascularGroup = new THREE.Group();
    vascularGroup.position.set(0, -1.0, 0);
    const vascularGeo = new THREE.RingGeometry(0.65, 0.85, 24);
    const vascularMat = new THREE.MeshBasicMaterial({
      color: getOrganColor('vascular'),
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const vascularMesh = new THREE.Mesh(vascularGeo, vascularMat);
    vascularMesh.rotation.x = Math.PI / 2;
    vascularMesh.userData = { organId: 'vascular' };
    vascularGroup.add(vascularMesh);
    twinGroup.add(vascularGroup);
    organMeshes['vascular'] = vascularMesh;
    organGroups['vascular'] = vascularGroup;

    // Holographic Circular Platform Grid
    const gridGeo = new THREE.RingGeometry(1.6, 2.5, 32);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const floorGrid = new THREE.Mesh(gridGeo, gridMat);
    floorGrid.rotation.x = Math.PI / 2;
    floorGrid.position.y = -1.9;
    scene.add(floorGrid);

    // Interactive Raycaster for Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(twinGroup.children, true);

      for (const hit of intersects) {
        let currentObj: THREE.Object3D | null = hit.object;
        while (currentObj && !currentObj.userData.organId && currentObj !== twinGroup) {
          currentObj = currentObj.parent;
        }
        if (currentObj && currentObj.userData.organId) {
          onSelectOrgan(currentObj.userData.organId);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Mouse Drag Rotation Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      twinGroup.rotation.y += deltaX * 0.008;
      twinGroup.rotation.x += deltaY * 0.005;
      twinGroup.rotation.x = Math.max(-0.4, Math.min(0.4, twinGroup.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const currentHr = vitalsRef.current.heartRate;
      const currentRr = vitalsRef.current.respRate;

      // 1. Auto-rotation when enabled and user not actively dragging
      if (autoRotateRef.current && !isDragging) {
        twinGroup.rotation.y += 0.005;
      }

      // 2. Synchronized Cardiac Pulsation (Scale heartbeat according to patient HR)
      // Cycle frequency in Hz = HR / 60
      const cardiacFreq = (currentHr / 60) * 2 * Math.PI;
      const cardiacBeat = Math.pow(Math.sin(elapsedTime * cardiacFreq), 8); // Sharp systolic contraction
      const heartScale = 1.0 + cardiacBeat * 0.28;
      heartGroup.scale.set(heartScale, heartScale, heartScale);

      // 3. Synchronized Respiratory Motion (Expand lungs according to RR)
      const respFreq = (currentRr / 60) * 2 * Math.PI;
      const respExpansion = 1.0 + Math.sin(elapsedTime * respFreq) * 0.14;
      lungsGroup.scale.set(respExpansion, respExpansion, respExpansion);

      // 4. Update Organ Colors dynamically based on organ stress changes
      organsRef.current.forEach((org) => {
        const mesh = organMeshes[org.id];
        if (mesh) {
          const targetColor = stressColorMap[org.stressLevel] || 0x06b6d4;
          const mat = mesh.material;
          if (!Array.isArray(mat) && mat && 'color' in mat) {
            (mat as THREE.MeshStandardMaterial).color.setHex(targetColor);
            if (selectedOrganRef.current === org.id) {
              const pulse = 0.7 + Math.sin(elapsedTime * 6) * 0.3;
              mat.opacity = pulse;
            } else {
              mat.opacity = 0.8;
            }
          }
        }
      });

      // Subtle hover floating motion
      twinGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;
      floorGrid.rotation.z += 0.002;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectOrgan]);

  const activeOrgan = organs.find((o) => o.id === selectedOrganId);

  return (
    <div className="relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-full min-h-[380px]">
      {/* 3D Viewport Controls Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-cyan-300">BIO-TWIN 3D PERFUSION MATRIX</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
              autoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/85 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle twin 360 rotation"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{autoRotate ? 'ROTATE ON' : 'ROTATE OFF'}</span>
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 min-h-[320px] cursor-grab active:cursor-grabbing" />

      {/* Perfusion Color Legend Bar */}
      <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-wrap items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono select-none">
        <span className="text-slate-400 font-semibold mr-1">PERFUSION:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-400">Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-cyan-300">Compensated</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-amber-400">Ischemic</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-400">Failing</span>
        </div>
      </div>

      {/* Organ Selector Chips */}
      <div className="absolute bottom-2.5 right-2.5 z-10 flex flex-wrap items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs font-mono">
        {organs.map((org) => {
          const isSelected = org.id === selectedOrganId;
          const badgeColor =
            org.stressLevel === 'critical'
              ? 'text-red-400 border-red-800/50'
              : org.stressLevel === 'failing'
              ? 'text-amber-400 border-amber-800/50'
              : 'text-slate-300 border-slate-700';

          return (
            <button
              key={org.id}
              type="button"
              onClick={() => onSelectOrgan(isSelected ? null : org.id)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm'
                  : `bg-slate-800/80 hover:bg-slate-700 ${badgeColor}`
              }`}
            >
              {org.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Selected Organ Deep-Dive Card Overlay */}
      {activeOrgan && (
        <div className="absolute top-12 left-2.5 max-w-xs z-20 bg-slate-900/95 backdrop-blur-lg border border-cyan-500/50 p-3 rounded-xl shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeOrgan.name.toUpperCase()}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectOrgan(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              &times;
            </button>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Microvascular Perfusion:</span>
              <span
                className={`font-bold ${
                  activeOrgan.perfusionIndex >= 70
                    ? 'text-emerald-400'
                    : activeOrgan.perfusionIndex >= 45
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {activeOrgan.perfusionIndex}%
              </span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  activeOrgan.perfusionIndex >= 70
                    ? 'bg-emerald-500'
                    : activeOrgan.perfusionIndex >= 45
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${activeOrgan.perfusionIndex}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Stress Status:</span>
              <span
                className={`font-bold uppercase flex items-center gap-1 ${
                  activeOrgan.stressLevel === 'critical'
                    ? 'text-red-400'
                    : activeOrgan.stressLevel === 'failing'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {activeOrgan.stressLevel === 'critical' ? (
                  <ShieldAlert className="w-3 h-3" />
                ) : activeOrgan.stressLevel === 'failing' ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                {activeOrgan.stressLevel}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded border border-slate-800 leading-relaxed">
              {activeOrgan.clinicalNotes}
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {activeOrgan.biomarkers.map((b, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded bg-slate-950 border ${
                    b.alert ? 'border-red-900/60 text-red-300' : 'border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">{b.label}</div>
                  <div className="font-bold text-xs">
                    {b.value} <span className="text-[9px] text-slate-500">{b.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
