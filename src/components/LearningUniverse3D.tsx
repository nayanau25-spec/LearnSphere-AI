import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

interface Props {
  liteMode: boolean;
  onToggleLiteMode: () => void;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function checkWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    );
  } catch {
    return false;
  }
}

/**
 * Composite 3-part miniature floating book node (cover, pages, glowing spine)
 */
function createBookNodeGroup(accentHex: number): THREE.Group {
  const group = new THREE.Group();

  const coverGeo = new THREE.BoxGeometry(0.42, 0.06, 0.56);
  const coverMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    roughness: 0.35,
    metalness: 0.45,
  });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  group.add(cover);

  const pagesGeo = new THREE.BoxGeometry(0.36, 0.08, 0.5);
  const pagesMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.85,
    metalness: 0.05,
  });
  const pages = new THREE.Mesh(pagesGeo, pagesMat);
  pages.position.y = 0.03;
  group.add(pages);

  const beaconGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 0.18, 0);
  group.add(beacon);

  return group;
}

const LightweightFallbackVisual: React.FC = () => (
  <div
    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0A1128] p-8"
    data-testid="learning-universe-fallback"
  >
    <svg
      viewBox="0 0 420 420"
      className="h-full max-h-[360px] w-full max-w-[360px]"
      role="img"
      aria-label="Connected learning orbit illustration showing rural knowledge nodes syncing offline and online"
    >
      <defs>
        <radialGradient id="globeGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
          <stop offset="65%" stopColor="#1E3A8A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0A1128" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="210" cy="210" r="185" fill="url(#globeGlow)" />
      <circle
        cx="210"
        cy="210"
        r="102"
        fill="#0F172A"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="102"
        ry="38"
        fill="none"
        stroke="#2563EB"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="44"
        ry="102"
        fill="none"
        stroke="#2563EB"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="168"
        ry="62"
        transform="rotate(-22 210 210)"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="168"
        ry="62"
        transform="rotate(25 210 210)"
        fill="none"
        stroke="#7C3AED"
        strokeOpacity="0.85"
        strokeWidth="1.75"
      />
      <g transform="translate(182 184)">
        <path
          d="M0 10 C12 2, 22 2, 28 10 C34 2, 44 2, 56 10 V48 C44 40, 34 40, 28 48 C22 40, 12 40, 0 48 Z"
          fill="#F8FAFC"
        />
        <line
          x1="28"
          y1="10"
          x2="28"
          y2="48"
          stroke="#0F172A"
          strokeWidth="2.5"
        />
      </g>
      <circle cx="82" cy="145" r="9" fill="#06B6D4" />
      <circle cx="344" cy="264" r="9" fill="#3B82F6" />
      <circle cx="288" cy="96" r="8" fill="#8B5CF6" />
    </svg>
  </div>
);

export const LearningUniverse3D: React.FC<Props> = ({
  liteMode,
  onToggleLiteMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    setWebGLSupported(checkWebGLAvailable());
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const useFallback = liteMode || prefersReducedMotion || !webGLSupported;

  useEffect(() => {
    if (useFallback) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1128);
    scene.fog = new THREE.FogExp2(0x0a1128, 0.045);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmremGenerator.dispose();

    // Warm key + cool hemisphere + violet rim lighting
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.85);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Master Universe Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 1. Core Educational Globe (solid core + geometric wireframe lattice)
    const globeGroup = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(1.38, 28, 28);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10224f,
      roughness: 0.42,
      metalness: 0.55,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    const latticeGeo = new THREE.IcosahedronGeometry(1.44, 2);
    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.7,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    globeGroup.add(latticeMesh);

    // Network Hub Markers on the globe surface
    const hubCoords = [
      [0.9, 0.8, 0.85],
      [-1.05, 0.45, 0.9],
      [0.4, -0.95, 1.0],
      [-0.6, -0.7, -1.05],
      [1.1, -0.35, -0.8],
    ];
    const hubGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });
    for (const [hx, hy, hz] of hubCoords) {
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.position.set(hx, hy, hz).normalize().multiplyScalar(1.46);
      globeGroup.add(hub);
    }

    universeGroup.add(globeGroup);

    // 2. Dual Learning Orbit Rings (Continuity + Adaptation)
    const ring1Geo = new THREE.TorusGeometry(2.15, 0.025, 12, 72);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.set(Math.PI / 2.6, 0.32, 0);
    universeGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.45, 0.02, 12, 72);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.75,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.set(-Math.PI / 3.1, -0.4, 0.2);
    universeGroup.add(ring2);

    // 3. Orbiting Composite Book Satellites (Math, Science, English)
    const satellites: Array<{
      pivot: THREE.Group;
      node: THREE.Group;
      speed: number;
      radius: number;
      tiltX: number;
      tiltZ: number;
    }> = [];

    const satSpecs = [
      {color: 0x38bdf8, radius: 2.15, speed: 0.42, tiltX: 0.35, tiltZ: 0.22},
      {color: 0x34d399, radius: 2.45, speed: -0.32, tiltX: -0.45, tiltZ: -0.18},
      {color: 0xa78bfa, radius: 2.28, speed: 0.26, tiltX: 0.15, tiltZ: -0.42},
    ];

    for (const spec of satSpecs) {
      const pivot = new THREE.Group();
      pivot.rotation.set(spec.tiltX, 0, spec.tiltZ);
      const node = createBookNodeGroup(spec.color);
      node.position.set(spec.radius, 0, 0);
      pivot.add(node);
      universeGroup.add(pivot);
      satellites.push({
        pivot,
        node,
        speed: spec.speed,
        radius: spec.radius,
        tiltX: spec.tiltX,
        tiltZ: spec.tiltZ,
      });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Subtle pointer tilt without blocking scroll
    let targetRotX = 0;
    let targetRotY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 0.22;
      targetRotX = ny * 0.14;
    };
    container.addEventListener('pointermove', handlePointerMove);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      globeGroup.rotation.y += dt * 0.22;
      universeGroup.rotation.x = THREE.MathUtils.damp(
        universeGroup.rotation.x,
        targetRotX,
        3.5,
        dt,
      );
      universeGroup.rotation.y = THREE.MathUtils.damp(
        universeGroup.rotation.y,
        targetRotY,
        3.5,
        dt,
      );

      for (const sat of satellites) {
        sat.pivot.rotation.y += dt * sat.speed;
        sat.node.rotation.y = -sat.pivot.rotation.y;
        sat.node.position.y = Math.sin(elapsed * 1.4 + sat.radius) * 0.12;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [useFallback]);

  return (
    <div className="relative flex h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0A1128] lg:h-[420px]">
      {useFallback ? (
        <LightweightFallbackVisual />
      ) : (
        <div
          ref={mountRef}
          className="h-full w-full"
          data-testid="learning-universe-3d"
          aria-label="Interactive 3D connected learning globe with orbiting knowledge nodes"
        />
      )}

      <div className="flex items-center justify-between border-t border-white/10 bg-[#080E21] px-4 py-2.5 text-xs text-slate-300">
        <span>
          Connected Knowledge Orbit · Local Storage + Low-Bandwidth Sync
        </span>
        <button
          type="button"
          onClick={onToggleLiteMode}
          className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/15 whitespace-nowrap shrink-0"
        >
          {liteMode ? 'Enable 3D View' : 'Lite Mode (Low Power)'}
        </button>
      </div>
    </div>
  );
};
