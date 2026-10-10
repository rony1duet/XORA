/**
 * XORA Celestial Hero 3D Component
 * Physically shaded interactive planetary system:
 * - Earth with axial tilt, specular ocean reflections, procedural continent biomes, independent cloud layer, and atmospheric Fresnel glow.
 * - Moon revolving along an inclined elliptical lunar orbit around Earth with visible orbital trajectory ring.
 * - Mars revolving on its interplanetary orbital trajectory with distinct iron-oxide topography and polar cap.
 * - Interactive raycasting, hover telemetry cards, smooth orbit drag, and responsive framing.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass, BookOpen, RotateCcw, Play, Pause, ExternalLink } from 'lucide-react';
import { CelestialBody } from '../types/analog';

interface CelestialHero3DProps {
  onExplore: (body?: CelestialBody) => void;
  onMethodology: () => void;
}

export const CelestialHero3D: React.FC<CelestialHero3DProps> = ({
  onExplore,
  onMethodology,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [activeTelemetry, setActiveTelemetry] = useState<{
    name: string;
    sub: string;
    gravity: string;
    targetBody?: CelestialBody;
    x: number;
    y: number;
  } | null>(null);

  // References to communicate with Three.js animation loop
  const isRotatingRef = useRef<boolean>(true);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  const targetFocusRef = useRef<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Verification
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGlAvailable(false);
      return;
    }

    // 2. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 19);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Deep Space Starfield & Subtle Cosmic Dust
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 140;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = (Math.random() - 0.5) * 80 - 25;

      // Subtle cyan / warm / white stars
      const tint = Math.random();
      if (tint > 0.8) {
        starColors[i] = 0.55;
        starColors[i + 1] = 0.85;
        starColors[i + 2] = 1.0;
      } else if (tint > 0.6) {
        starColors[i] = 1.0;
        starColors[i + 1] = 0.82;
        starColors[i + 2] = 0.65;
      } else {
        starColors[i] = 0.85;
        starColors[i + 1] = 0.9;
        starColors[i + 2] = 0.95;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 4. Primary Orbital Master Group
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    // Base position for desktop: framed on the right stage
    const baseOffset = { x: 3.6, y: 0.2, z: 0 };
    systemGroup.position.set(baseOffset.x, baseOffset.y, baseOffset.z);

    // -------------------------------------------------------------
    // PROCEDURAL TEXTURE GENERATORS
    // -------------------------------------------------------------

    // A. Earth Texture Generator (Continents, Biomes, Ocean Depth)
    const createEarthTexture = (): { diffuse: THREE.CanvasTexture; specular: THREE.CanvasTexture } => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Deep Ocean Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#041528');
      oceanGrad.addColorStop(0.5, '#072445');
      oceanGrad.addColorStop(1, '#041528');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // Continental Shelf Shallow Waters (Turquoise fringing)
      ctx.fillStyle = '#0a4266';
      for (let i = 0; i < 70; i++) {
        const x = (Math.sin(i * 1.7) * 0.5 + 0.5) * 2048;
        const y = 160 + (Math.cos(i * 2.3) * 0.5 + 0.5) * 700;
        const r = 70 + (i % 9) * 16;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Landmasses: Green Biomes
      ctx.fillStyle = '#1c4430';
      for (let i = 0; i < 55; i++) {
        const x = ((i * 137.5) % 2048);
        const y = 180 + ((i * 73) % 660);
        const r = 45 + ((i * 17) % 85);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arid / Desert belts (Sahara, Atacama, Outback)
      ctx.fillStyle = '#82653c';
      for (let i = 0; i < 30; i++) {
        const x = ((i * 211) % 2048);
        const y = 300 + ((i * 91) % 420);
        const r = 30 + ((i * 13) % 55);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // High Mountain alpine snow caps
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 18; i++) {
        const x = ((i * 289) % 2048);
        const y = 250 + ((i * 87) % 520);
        const r = 12 + ((i * 5) % 20);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar Ice Caps
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 2048, 70);
      ctx.fillRect(0, 954, 2048, 70);

      const diffuse = new THREE.CanvasTexture(canvas);
      diffuse.wrapS = THREE.RepeatWrapping;

      // Specular Map (ocean shines, land is matte)
      const specCanvas = document.createElement('canvas');
      specCanvas.width = 1024;
      specCanvas.height = 512;
      const sCtx = specCanvas.getContext('2d')!;
      sCtx.fillStyle = '#445566'; // ocean reflection
      sCtx.fillRect(0, 0, 1024, 512);
      sCtx.drawImage(canvas, 0, 0, 1024, 512);
      const spec = new THREE.CanvasTexture(specCanvas);

      return { diffuse, specular: spec };
    };

    // B. Cloud Layer Generator
    const createCloudTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);

      // Cloud swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = 0; i < 65; i++) {
        const x = Math.random() * 1024;
        const y = 90 + Math.random() * 332;
        const w = 50 + Math.random() * 130;
        const h = 18 + Math.random() * 45;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // C. Moon Texture Generator
    const createMoonTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Lunar Anorthosite Highland Base
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 1024, 512);

      // Lunar Basalt Maria (Darker plains)
      ctx.fillStyle = '#2d3748';
      for (let i = 0; i < 24; i++) {
        const mx = ((i * 123) % 1024);
        const my = 80 + ((i * 67) % 352);
        const mr = 28 + ((i * 15) % 65);
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Impact Craters with Bright Ejecta Rays
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 50; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const cr = 4 + Math.random() * 18;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // D. Mars Texture Generator
    const createMarsTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Rust / Iron-Oxide Base
      const rustGrad = ctx.createLinearGradient(0, 0, 0, 512);
      rustGrad.addColorStop(0, '#b44414');
      rustGrad.addColorStop(0.5, '#c8501c');
      rustGrad.addColorStop(1, '#9b380f');
      ctx.fillStyle = rustGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Dark Volcanic Basaltic Highlands (Syrtis Major & Acidalia)
      ctx.fillStyle = '#6e2712';
      for (let i = 0; i < 28; i++) {
        const x = ((i * 151) % 1024);
        const y = 90 + ((i * 79) % 332);
        const r = 24 + ((i * 17) % 68);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Valles Marineris Canyon Rift Scar
      ctx.strokeStyle = '#4e1c0c';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(350, 260);
      ctx.bezierCurveTo(460, 275, 540, 250, 680, 265);
      ctx.stroke();

      // North & South Polar Ice Caps (CO2 Frost)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(512, 18, 90, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(512, 496, 75, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // -------------------------------------------------------------
    // CELESTIAL BODIES CREATION
    // -------------------------------------------------------------

    // 1. EARTH PRIMARY
    const earthRadius = 3.8;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const { diffuse: earthTex, specular: earthSpec } = createEarthTexture();

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.15,
      roughnessMap: earthSpec,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Real axial tilt: 23.4 degrees (0.408 rad)
    earthMesh.rotation.z = 0.408;
    earthMesh.name = 'earth';
    systemGroup.add(earthMesh);

    // Earth Cloud Layer (Subtle outer sphere with independent spin)
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.08, 48, 48);
    const cloudTex = createCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthMesh.add(cloudMesh);

    // Earth Atmosphere Rayleigh Scattering Fresnel Glow
    const atmosGeo = new THREE.SphereGeometry(earthRadius + 0.28, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.24, 0.72, 0.98, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthMesh.add(atmosMesh);

    // 2. LUNAR ORBIT & THE MOON
    const lunarOrbitRadius = 6.8;
    const lunarOrbitGroup = new THREE.Group();
    // Lunar orbital inclination ~12 degrees
    lunarOrbitGroup.rotation.x = 0.22;
    lunarOrbitGroup.rotation.z = -0.16;
    systemGroup.add(lunarOrbitGroup);

    // Visible Lunar Orbit Trajectory Ring
    const lunarOrbitGeo = new THREE.BufferGeometry();
    const orbitPointsCount = 128;
    const lunarOrbitPoints = new Float32Array((orbitPointsCount + 1) * 3);
    for (let i = 0; i <= orbitPointsCount; i++) {
      const theta = (i / orbitPointsCount) * Math.PI * 2;
      lunarOrbitPoints[i * 3] = Math.cos(theta) * lunarOrbitRadius;
      lunarOrbitPoints[i * 3 + 1] = 0;
      lunarOrbitPoints[i * 3 + 2] = Math.sin(theta) * lunarOrbitRadius;
    }
    lunarOrbitGeo.setAttribute('position', new THREE.BufferAttribute(lunarOrbitPoints, 3));
    const lunarOrbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
    });
    const lunarOrbitLine = new THREE.Line(lunarOrbitGeo, lunarOrbitMat);
    lunarOrbitGroup.add(lunarOrbitLine);

    // The Moon Mesh
    const moonRadius = 1.05;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 32, 32);
    const moonTex = createMoonTexture();
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.name = 'moon';
    lunarOrbitGroup.add(moonMesh);

    // 3. MARS INTERPLANETARY ORBIT
    const marsOrbitRadiusX = 11.2;
    const marsOrbitRadiusZ = 8.8;
    const marsOrbitGroup = new THREE.Group();
    marsOrbitGroup.rotation.x = -0.18;
    marsOrbitGroup.rotation.y = 0.25;
    systemGroup.add(marsOrbitGroup);

    // Visible Mars Orbit Trajectory Ring
    const marsOrbitGeo = new THREE.BufferGeometry();
    const marsPointsCount = 128;
    const marsOrbitPoints = new Float32Array((marsPointsCount + 1) * 3);
    for (let i = 0; i <= marsPointsCount; i++) {
      const theta = (i / marsPointsCount) * Math.PI * 2;
      marsOrbitPoints[i * 3] = Math.cos(theta) * marsOrbitRadiusX;
      marsOrbitPoints[i * 3 + 1] = 0;
      marsOrbitPoints[i * 3 + 2] = Math.sin(theta) * marsOrbitRadiusZ;
    }
    marsOrbitGeo.setAttribute('position', new THREE.BufferAttribute(marsOrbitPoints, 3));
    const marsOrbitMat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.24,
    });
    const marsOrbitLine = new THREE.Line(marsOrbitGeo, marsOrbitMat);
    marsOrbitGroup.add(marsOrbitLine);

    // Mars Mesh
    const marsRadius = 1.6;
    const marsGeo = new THREE.SphereGeometry(marsRadius, 48, 48);
    const marsTex = createMarsTexture();
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.82,
      metalness: 0.08,
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.rotation.z = 0.44; // 25.2 degrees axial tilt
    marsMesh.name = 'mars';
    marsOrbitGroup.add(marsMesh);

    // Mars Thin Atmospheric Rim Glow
    const marsAtmosGeo = new THREE.SphereGeometry(marsRadius + 0.12, 32, 32);
    const marsAtmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.96, 0.48, 0.24, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const marsAtmosMesh = new THREE.Mesh(marsAtmosGeo, marsAtmosMat);
    marsMesh.add(marsAtmosMesh);

    // -------------------------------------------------------------
    // LIGHTING SETUP
    // -------------------------------------------------------------
    // Sun key light
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.6);
    sunLight.position.set(16, 9, 14);
    scene.add(sunLight);

    // Deep space fill light (cyan-hued cosmic reflection)
    const spaceFillLight = new THREE.DirectionalLight(0x0ea5e9, 0.7);
    spaceFillLight.position.set(-14, -6, -8);
    scene.add(spaceFillLight);

    // Ambient baseline
    const ambientLight = new THREE.AmbientLight(0x0b1324, 0.65);
    scene.add(ambientLight);

    // -------------------------------------------------------------
    // INTERACTIVE CONTROLS & RAYCASTING
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    const interactiveMeshes = [earthMesh, moonMesh, marsMesh];

    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onPointerDown = (e: MouseEvent) => {
      // Check if clicking directly on a planet
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const hitName = hits[0].object.name;
        if (hitName === 'earth') onExplore();
        else if (hitName === 'moon') onExplore('moon');
        else if (hitName === 'mars') onExplore('mars');
        return;
      }

      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Update Raycast Hover
      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);

      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const name = hitObj.name;
        setHoveredPlanet(name);
        container.style.cursor = 'pointer';

        // Set screen telemetry position
        if (name === 'earth') {
          setActiveTelemetry({
            name: 'Earth Primary',
            sub: '12 Proving Ground Sites',
            gravity: '9.81 m/s²',
            targetBody: undefined,
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        } else if (name === 'moon') {
          setActiveTelemetry({
            name: 'Moon Reference',
            sub: 'Artemis Polar Sites',
            gravity: '1.62 m/s²',
            targetBody: 'moon',
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        } else if (name === 'mars') {
          setActiveTelemetry({
            name: 'Mars Reference',
            sub: 'Jezero · Gale · Oxia',
            gravity: '3.71 m/s²',
            targetBody: 'mars',
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        }
      } else {
        setHoveredPlanet(null);
        setActiveTelemetry(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }

      if (isDragging) {
        const deltaX = clientX - prevPointerX;
        const deltaY = clientY - prevPointerY;
        velocityX = deltaX * 0.004;
        velocityY = deltaY * 0.004;

        systemGroup.rotation.y += velocityX;
        systemGroup.rotation.x += velocityY;

        prevPointerX = clientX;
        prevPointerY = clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = hoveredPlanet ? 'pointer' : 'grab';
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Responsive Framing
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      if (width < 640) {
        // Mobile phone
        systemGroup.position.set(0, -3.2, -4.5);
        systemGroup.scale.set(0.68, 0.68, 0.68);
      } else if (width < 1024) {
        // Tablet / small screen
        systemGroup.position.set(1.2, -2.4, -2.5);
        systemGroup.scale.set(0.8, 0.8, 0.8);
      } else {
        // Desktop / large display: right half stage
        systemGroup.position.set(baseOffset.x, baseOffset.y, baseOffset.z);
        systemGroup.scale.set(1.0, 1.0, 1.0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // ANIMATION & ORBIT MECHANICS LOOP
    // -------------------------------------------------------------
    let animId: number;
    let moonOrbitAngle = 0.8;
    let marsOrbitAngle = 3.6;

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Inertial damping from drag
      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        systemGroup.rotation.y += velocityX;
        systemGroup.rotation.x += velocityY;
      }

      // Orbital Revolutions & Axial Rotations
      if (isRotatingRef.current) {
        // 1. Earth rotates on axis + independent cloud drift
        earthMesh.rotation.y += 0.0022;
        cloudMesh.rotation.y += 0.0031;

        // 2. Moon revolves in elliptical orbit around Earth
        moonOrbitAngle += 0.0055;
        moonMesh.position.x = Math.cos(moonOrbitAngle) * lunarOrbitRadius;
        moonMesh.position.z = Math.sin(moonOrbitAngle) * lunarOrbitRadius;
        moonMesh.rotation.y += 0.002;

        // 3. Mars revolves along interplanetary path
        marsOrbitAngle += 0.0024;
        marsMesh.position.x = Math.cos(marsOrbitAngle) * marsOrbitRadiusX;
        marsMesh.position.z = Math.sin(marsOrbitAngle) * marsOrbitRadiusZ;
        marsMesh.rotation.y += 0.0028;

        // Subtle starfield parallax
        starPoints.rotation.y += 0.00015;
      }

      renderer.render(scene, camera);
    };
    animate();

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      // Dispose Geometries
      earthGeo.dispose();
      cloudGeo.dispose();
      atmosGeo.dispose();
      moonGeo.dispose();
      lunarOrbitGeo.dispose();
      marsGeo.dispose();
      marsAtmosGeo.dispose();
      marsOrbitGeo.dispose();
      starGeo.dispose();

      // Dispose Materials & Textures
      earthMat.dispose();
      cloudMat.dispose();
      atmosMat.dispose();
      moonMat.dispose();
      lunarOrbitMat.dispose();
      marsMat.dispose();
      marsAtmosMat.dispose();
      marsOrbitMat.dispose();
      starMat.dispose();

      earthTex.dispose();
      earthSpec.dispose();
      cloudTex.dispose();
      moonTex.dispose();
      marsTex.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onExplore]);

  return (
    <div className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#07090E]">
      {/* 3D WebGL Canvas or Designed Static Fallback */}
      {webGlAvailable ? (
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full cursor-grab z-0"
          aria-label="Interactive 3D orbit system of Earth, Moon, and Mars"
        />
      ) : (
        /* Static Graceful Fallback */
        <div className="absolute inset-0 w-full h-full flex items-center justify-end pr-8 sm:pr-16 lg:pr-28 bg-gradient-to-b from-[#07090E] via-[#0B0F17] to-[#111622] z-0 p-8">
          <div className="relative w-80 h-80 rounded-full border border-cyan-500/20 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-gradient-to-br from-emerald-900/40 via-cyan-900/30 to-blue-950/60 border border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex items-center justify-center">
              <span className="font-mono text-xs text-cyan-300">Earth Primary</span>
            </div>
            <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-300">
              Moon
            </div>
            <div className="absolute bottom-6 right-8 w-24 h-24 rounded-full bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-[11px] font-mono text-amber-300">
              Mars
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive Hover Telemetry Tooltip */}
      {activeTelemetry && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full px-3 py-2 rounded-lg bg-[#0E1523]/95 backdrop-blur-md border border-cyan-500/40 shadow-xl text-left transition-all duration-75"
          style={{ left: activeTelemetry.x, top: activeTelemetry.y }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              {activeTelemetry.name}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-sans mt-0.5">
            {activeTelemetry.sub}
          </div>
          <div className="text-[10px] font-mono text-cyan-300 mt-1 flex items-center justify-between gap-3">
            <span>Gravity: {activeTelemetry.gravity}</span>
            <span className="text-slate-400">Click to Inspect →</span>
          </div>
        </div>
      )}

      {/* Top Banner & Planetary Controls */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-400 tracking-widest uppercase pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-bold text-white tracking-widest">XORA</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 tracking-wider">Planetary Proving Ground Atlas</span>
        </div>

        {/* Orbit Simulation Controls */}
        <div className="text-[11px] font-mono text-slate-300 pointer-events-auto flex items-center gap-3 bg-[#0B0F17]/90 px-3 py-1.5 rounded-full border border-slate-800/80 backdrop-blur-md shadow-sm">
          <span className="hidden sm:inline text-slate-400">Orbital Trajectories Active</span>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-cyan-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isRotating ? 'Pause planetary orbits' : 'Resume planetary orbits'}
          >
            {isRotating ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editorial Headline Hero Stage */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 my-auto pointer-events-none">
        <div className="max-w-xl xl:max-w-2xl space-y-6 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs font-mono text-cyan-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Quantitative Planetary Terrain Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] text-balance uppercase font-sans">
            Explore Beyond Earth.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-sans max-w-2xl font-light">
            Match Moon and Mars landing regions with calibrated Earth test sites. 
            Evaluate surface roughness, slope CDFs, and physical limitations before flight hardware leaves the ground.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <button
              onClick={() => onExplore()}
              className="px-6 py-3.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Terrain Explorer</span>
            </button>

            <button
              onClick={onMethodology}
              className="px-6 py-3.5 text-sm font-semibold text-slate-200 bg-[#0E121C]/90 hover:bg-[#161B26] hover:text-white border border-[#1F2737] rounded-lg transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Scoring Methodology</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Celestial World Selector Cards */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Earth Card */}
          <div
            onClick={() => onExplore()}
            className="p-3.5 rounded-xl bg-[#0B0F17]/85 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>Earth Proving Ground</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">12 Analog Sites</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 font-light">
              Atacama, Haughton, Lanzarote, McMurdo, Svalbard.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Gravity: 9.81 m/s²</span>
              <span className="text-emerald-300 group-hover:underline flex items-center gap-1">
                Explore Proving Grounds →
              </span>
            </div>
          </div>

          {/* Moon Card */}
          <div
            onClick={() => onExplore('moon')}
            className="p-3.5 rounded-xl bg-[#0B0F17]/85 backdrop-blur-md border border-slate-800/80 hover:border-cyan-500/60 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span>Lunar Targets</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Artemis Baselines</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 font-light">
              Shackleton Rim, Taurus-Littrow, Tranquillitatis Pit.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Gravity: 1.62 m/s²</span>
              <span className="text-cyan-300 group-hover:underline flex items-center gap-1">
                Find Lunar Twins →
              </span>
            </div>
          </div>

          {/* Mars Card */}
          <div
            onClick={() => onExplore('mars')}
            className="p-3.5 rounded-xl bg-[#0B0F17]/85 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/60 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span>Martian Targets</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Rover Exploration</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 font-light">
              Jezero Crater Delta, Gale Crater, Oxia Planum.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Gravity: 3.71 m/s²</span>
              <span className="text-amber-300 group-hover:underline flex items-center gap-1">
                Find Mars Twins →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
