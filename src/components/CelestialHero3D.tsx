/**
 * XORA Celestial Hero 3D Component
 * Ultra-realistic WebGL planetary system:
 * - Earth with realistic axial tilt, specular ocean glint, night-side city lights emission, independent cloud layer, and Rayleigh atmospheric Fresnel aura.
 * - Satellites in orbit:
 *   - LEO Science Station orbiting Earth with dual solar wings and telemetry beacon.
 *   - GEO Communications Satellite orbiting Earth in inclined geosynchronous orbit.
 *   - LRO (Lunar Reconnaissance Orbiter) orbiting the Moon.
 *   - MRO (Mars Reconnaissance Orbiter) orbiting Mars.
 * - Moon revolving along inclined lunar trajectory with real basaltic maria shading.
 * - Mars revolving on interplanetary path with polar ice cap and thin CO2 atmospheric haze.
 * - Interactive raycasting, hover telemetry cards, smooth orbit drag, and responsive framing.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';
import { CelestialBody } from '../types/analog';

interface CelestialHero3DProps {
  onExplore?: (body?: CelestialBody) => void;
  onCompare?: () => void;
}

export const CelestialHero3D: React.FC<CelestialHero3DProps> = () => {
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

  const isRotatingRef = useRef<boolean>(true);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Verification
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGlAvailable(false);
      return;
    }

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0.6, 0.2, 19.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Realistic Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 150;
      starPositions[i + 1] = (Math.random() - 0.5) * 130;
      starPositions[i + 2] = (Math.random() - 0.5) * 90 - 25;

      const tint = Math.random();
      if (tint > 0.85) {
        starColors[i] = 0.6;
        starColors[i + 1] = 0.85;
        starColors[i + 2] = 1.0;
      } else if (tint > 0.65) {
        starColors[i] = 1.0;
        starColors[i + 1] = 0.85;
        starColors[i + 2] = 0.7;
      } else {
        starColors[i] = 0.9;
        starColors[i + 1] = 0.95;
        starColors[i + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 4. Primary Orbital Master Group
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    const baseOffset = { x: 4.4, y: 0.1, z: 0 };
    systemGroup.position.set(baseOffset.x, baseOffset.y, baseOffset.z);

    // -------------------------------------------------------------
    // PROCEDURAL REALISTIC TEXTURES
    // -------------------------------------------------------------

    // A. Earth Diffuse, Specular & Night City Lights
    const createEarthTextures = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Deep Ocean Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#031222');
      oceanGrad.addColorStop(0.5, '#052242');
      oceanGrad.addColorStop(1, '#031222');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // Shallow Coastal Shelf
      ctx.fillStyle = '#0a3d5f';
      for (let i = 0; i < 75; i++) {
        const x = (Math.sin(i * 1.7) * 0.5 + 0.5) * 2048;
        const y = 160 + (Math.cos(i * 2.3) * 0.5 + 0.5) * 700;
        const r = 70 + (i % 9) * 18;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Landmasses: Green Biomes
      ctx.fillStyle = '#173c28';
      for (let i = 0; i < 60; i++) {
        const x = ((i * 137.5) % 2048);
        const y = 180 + ((i * 73) % 660);
        const r = 45 + ((i * 17) % 85);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arid & Desert belts
      ctx.fillStyle = '#7a5e38';
      for (let i = 0; i < 35; i++) {
        const x = ((i * 211) % 2048);
        const y = 300 + ((i * 91) % 420);
        const r = 30 + ((i * 13) % 55);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Alpine Snow Peaks
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 20; i++) {
        const x = ((i * 289) % 2048);
        const y = 250 + ((i * 87) % 520);
        const r = 14 + ((i * 5) % 22);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar Ice Caps
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 2048, 75);
      ctx.fillRect(0, 949, 2048, 75);

      const diffuse = new THREE.CanvasTexture(canvas);
      diffuse.wrapS = THREE.RepeatWrapping;

      // Specular Map
      const specCanvas = document.createElement('canvas');
      specCanvas.width = 1024;
      specCanvas.height = 512;
      const sCtx = specCanvas.getContext('2d')!;
      sCtx.fillStyle = '#556677';
      sCtx.fillRect(0, 0, 1024, 512);
      sCtx.drawImage(canvas, 0, 0, 1024, 512);
      const specular = new THREE.CanvasTexture(specCanvas);

      // Night City Lights Emissive Map
      const nightCanvas = document.createElement('canvas');
      nightCanvas.width = 1024;
      nightCanvas.height = 512;
      const nCtx = nightCanvas.getContext('2d')!;
      nCtx.fillStyle = '#000000';
      nCtx.fillRect(0, 0, 1024, 512);

      // Golden city light clusters across continents
      nCtx.fillStyle = 'rgba(254, 215, 170, 0.85)';
      for (let i = 0; i < 220; i++) {
        const nx = ((i * 67.3) % 1024);
        const ny = 120 + ((i * 43.1) % 270);
        const nr = 1.2 + (Math.random() * 2.2);
        nCtx.beginPath();
        nCtx.arc(nx, ny, nr, 0, Math.PI * 2);
        nCtx.fill();
      }
      const nightLights = new THREE.CanvasTexture(nightCanvas);
      nightLights.wrapS = THREE.RepeatWrapping;

      return { diffuse, specular, nightLights };
    };

    // B. Clouds Texture
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * 1024;
        const y = 80 + Math.random() * 352;
        const w = 55 + Math.random() * 140;
        const h = 16 + Math.random() * 45;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, (Math.random() - 0.5) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // C. Moon Texture
    const createMoonTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 1024, 512);

      // Dark Basalt Maria
      ctx.fillStyle = '#263140';
      for (let i = 0; i < 28; i++) {
        const mx = ((i * 123) % 1024);
        const my = 80 + ((i * 67) % 352);
        const mr = 26 + ((i * 15) % 68);
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Impact Craters with Ejecta Rays
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 60; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const cr = 4 + Math.random() * 16;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // D. Mars Texture
    const createMarsTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      const rustGrad = ctx.createLinearGradient(0, 0, 0, 512);
      rustGrad.addColorStop(0, '#b84614');
      rustGrad.addColorStop(0.5, '#cc541d');
      rustGrad.addColorStop(1, '#9e390f');
      ctx.fillStyle = rustGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Volcanic dark plains
      ctx.fillStyle = '#6b2510';
      for (let i = 0; i < 30; i++) {
        const x = ((i * 151) % 1024);
        const y = 90 + ((i * 79) % 332);
        const r = 24 + ((i * 17) % 68);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Valles Marineris canyon
      ctx.strokeStyle = '#4a1a0b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(340, 260);
      ctx.bezierCurveTo(460, 275, 540, 250, 690, 265);
      ctx.stroke();

      // Polar Ice Caps
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(512, 18, 95, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(512, 496, 80, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };

    // -------------------------------------------------------------
    // SATELLITE 3D MODEL FACTORY
    // -------------------------------------------------------------
    const createSatelliteModel = (options: {
      busColor?: number;
      solarColor?: number;
      beaconColor?: number;
      scale?: number;
    }) => {
      const group = new THREE.Group();

      // Satellite Main Body (Thermal insulation foil bus)
      const busGeo = new THREE.BoxGeometry(0.24, 0.24, 0.34);
      const busMat = new THREE.MeshStandardMaterial({
        color: options.busColor || 0xd4af37, // gold foil
        metalness: 0.85,
        roughness: 0.25,
      });
      const bus = new THREE.Mesh(busGeo, busMat);
      group.add(bus);

      // Solar Panel Wings (Dual panels with blue photovoltaic cell finish)
      const wingGeo = new THREE.BoxGeometry(0.72, 0.02, 0.22);
      const wingMat = new THREE.MeshStandardMaterial({
        color: options.solarColor || 0x1e3a8a, // deep blue solar cell
        metalness: 0.9,
        roughness: 0.15,
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(0.56, 0, 0);
      group.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(-0.56, 0, 0);
      group.add(rightWing);

      // Communication Dish Antenna
      const dishGeo = new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = Math.PI;
      dish.position.set(0, 0.26, 0);
      group.add(dish);

      // Telemetry Beacon LED
      const beaconGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: options.beaconColor || 0x22d3ee,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 0.34, 0);
      group.add(beacon);

      const s = options.scale || 1.0;
      group.scale.set(s, s, s);

      return { group, beacon };
    };

    // Helper: Create Glowing Orbit Trajectory Ring
    const createOrbitRing = (radius: number, color: number, opacity = 0.25) => {
      const geo = new THREE.BufferGeometry();
      const points = 128;
      const vertices = new Float32Array((points + 1) * 3);
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        vertices[i * 3] = Math.cos(theta) * radius;
        vertices[i * 3 + 1] = 0;
        vertices[i * 3 + 2] = Math.sin(theta) * radius;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      return new THREE.Line(geo, mat);
    };

    // -------------------------------------------------------------
    // PLANETARY MESHES
    // -------------------------------------------------------------

    // 1. EARTH PRIMARY
    const earthRadius = 3.8;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const { diffuse: earthTex, specular: earthSpec, nightLights: earthNight } = createEarthTextures();

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.15,
      roughnessMap: earthSpec,
      emissiveMap: earthNight,
      emissive: new THREE.Color(0xffe49e),
      emissiveIntensity: 0.5,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.z = 0.408; // 23.4 degrees tilt
    earthMesh.name = 'earth';
    systemGroup.add(earthMesh);

    // Earth Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.08, 48, 48);
    const cloudTex = createCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthMesh.add(cloudMesh);

    // Earth Atmospheric Rayleigh Scattering Glow
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
          float intensity = pow(0.66 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.22, 0.72, 0.98, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthMesh.add(atmosMesh);

    // -------------------------------------------------------------
    // EARTH ORBITING SATELLITES
    // -------------------------------------------------------------
    // Satellite A: Low Earth Orbit (LEO) Space Station / Science Satellite
    const leoOrbitRadius = 5.1;
    const leoOrbitGroup = new THREE.Group();
    leoOrbitGroup.rotation.x = 0.52; // 30 deg inclination
    leoOrbitGroup.rotation.z = -0.25;
    systemGroup.add(leoOrbitGroup);

    const leoOrbitRing = createOrbitRing(leoOrbitRadius, 0x38bdf8, 0.28);
    leoOrbitGroup.add(leoOrbitRing);

    const { group: leoSatellite, beacon: leoBeacon } = createSatelliteModel({
      busColor: 0xe2e8f0, // silver/white space station
      solarColor: 0x1e40af,
      beaconColor: 0x38bdf8,
      scale: 0.9,
    });
    leoOrbitGroup.add(leoSatellite);

    // Satellite B: Geostationary (GEO) Communications Satellite
    const geoOrbitRadius = 6.2;
    const geoOrbitGroup = new THREE.Group();
    geoOrbitGroup.rotation.x = -0.18;
    geoOrbitGroup.rotation.y = 0.35;
    systemGroup.add(geoOrbitGroup);

    const geoOrbitRing = createOrbitRing(geoOrbitRadius, 0x06b6d4, 0.22);
    geoOrbitGroup.add(geoOrbitRing);

    const { group: geoSatellite, beacon: geoBeacon } = createSatelliteModel({
      busColor: 0xd4af37, // gold thermal foil
      solarColor: 0x1d4ed8,
      beaconColor: 0x10b981,
      scale: 0.85,
    });
    geoOrbitGroup.add(geoSatellite);

    // -------------------------------------------------------------
    // 2. LUNAR ORBIT & THE MOON (with Lunar Reconnaissance Orbiter)
    // -------------------------------------------------------------
    const lunarOrbitRadius = 7.4;
    const lunarOrbitGroup = new THREE.Group();
    lunarOrbitGroup.rotation.x = 0.22;
    lunarOrbitGroup.rotation.z = -0.16;
    systemGroup.add(lunarOrbitGroup);

    const lunarOrbitRing = createOrbitRing(lunarOrbitRadius, 0x38bdf8, 0.25);
    lunarOrbitGroup.add(lunarOrbitRing);

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

    // Satellite C: Lunar Reconnaissance Orbiter (LRO around Moon)
    const lroOrbitRadius = 1.8;
    const lroOrbitGroup = new THREE.Group();
    lroOrbitGroup.rotation.x = 1.35; // Polar orbit around moon
    moonMesh.add(lroOrbitGroup);

    const lroOrbitRing = createOrbitRing(lroOrbitRadius, 0x67e8f9, 0.3);
    lroOrbitGroup.add(lroOrbitRing);

    const { group: lroSatellite, beacon: lroBeacon } = createSatelliteModel({
      busColor: 0xd4af37,
      solarColor: 0x2563eb,
      beaconColor: 0x22d3ee,
      scale: 0.55,
    });
    lroOrbitGroup.add(lroSatellite);

    // -------------------------------------------------------------
    // 3. MARS & INTERPLANETARY ORBIT (with Mars Reconnaissance Orbiter)
    // -------------------------------------------------------------
    const marsOrbitRadiusX = 11.5;
    const marsOrbitRadiusZ = 9.0;
    const marsOrbitGroup = new THREE.Group();
    marsOrbitGroup.rotation.x = -0.18;
    marsOrbitGroup.rotation.y = 0.25;
    systemGroup.add(marsOrbitGroup);

    // Elliptical Mars Orbit Track
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

    const marsRadius = 1.6;
    const marsGeo = new THREE.SphereGeometry(marsRadius, 48, 48);
    const marsTex = createMarsTexture();
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.82,
      metalness: 0.08,
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.rotation.z = 0.44; // 25.2 degrees tilt
    marsMesh.name = 'mars';
    marsOrbitGroup.add(marsMesh);

    // Mars Atmosphere Rim Haze
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

    // Satellite D: Mars Reconnaissance Orbiter (MRO around Mars)
    const mroOrbitRadius = 2.45;
    const mroOrbitGroup = new THREE.Group();
    mroOrbitGroup.rotation.z = 1.25;
    marsMesh.add(mroOrbitGroup);

    const mroOrbitRing = createOrbitRing(mroOrbitRadius, 0xfb923c, 0.32);
    mroOrbitGroup.add(mroOrbitRing);

    const { group: mroSatellite, beacon: mroBeacon } = createSatelliteModel({
      busColor: 0xd97706,
      solarColor: 0x1e3a8a,
      beaconColor: 0xf59e0b,
      scale: 0.65,
    });
    mroOrbitGroup.add(mroSatellite);

    // -------------------------------------------------------------
    // LIGHTING SETUP
    // -------------------------------------------------------------
    const sunLight = new THREE.DirectionalLight(0xfff7ee, 2.7);
    sunLight.position.set(16, 9, 14);
    scene.add(sunLight);

    const spaceFillLight = new THREE.DirectionalLight(0x0ea5e9, 0.7);
    spaceFillLight.position.set(-14, -6, -8);
    scene.add(spaceFillLight);

    const ambientLight = new THREE.AmbientLight(0x0b1324, 0.6);
    scene.add(ambientLight);

    // -------------------------------------------------------------
    // INTERACTION & RAYCASTING
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
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);

      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const name = hitObj.name;
        setHoveredPlanet(name);

        if (name === 'earth') {
          setActiveTelemetry({
            name: 'Earth Primary',
            sub: '12 Proving Ground Sites · 2 Active Satellites',
            gravity: '9.81 m/s²',
            targetBody: undefined,
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        } else if (name === 'moon') {
          setActiveTelemetry({
            name: 'Moon Reference',
            sub: 'Artemis Polar Sites · LRO Orbiting',
            gravity: '1.62 m/s²',
            targetBody: 'moon',
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        } else if (name === 'mars') {
          setActiveTelemetry({
            name: 'Mars Reference',
            sub: 'Jezero · Gale · Oxia · MRO Orbiting',
            gravity: '3.71 m/s²',
            targetBody: 'mars',
            x: clientX - rect.left,
            y: clientY - rect.top - 20,
          });
        }
      } else {
        setHoveredPlanet(null);
        setActiveTelemetry(null);
      }

      container.style.cursor = isDragging ? 'grabbing' : 'grab';

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
      container.style.cursor = 'grab';
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
        systemGroup.position.set(0, -2.6, -3);
        systemGroup.scale.set(0.68, 0.68, 0.68);
      } else if (width < 1024) {
        systemGroup.position.set(2.0, -1.0, -1.6);
        systemGroup.scale.set(0.82, 0.82, 0.82);
      } else {
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

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        systemGroup.rotation.y += velocityX;
        systemGroup.rotation.x += velocityY;
      }

      if (isRotatingRef.current) {
        // 1. Earth Rotation & Clouds (continuous)
        earthMesh.rotation.y = elapsedTime * 0.14;
        cloudMesh.rotation.y = elapsedTime * 0.19;

        // 2. Satellites Revolutions around Earth (continuous 60fps)
        const leoAngle = 1.2 + elapsedTime * 0.95;
        leoSatellite.position.x = Math.cos(leoAngle) * leoOrbitRadius;
        leoSatellite.position.z = Math.sin(leoAngle) * leoOrbitRadius;
        leoSatellite.rotation.y = -leoAngle;

        const geoAngle = 4.5 + elapsedTime * 0.38;
        geoSatellite.position.x = Math.cos(geoAngle) * geoOrbitRadius;
        geoSatellite.position.z = Math.sin(geoAngle) * geoOrbitRadius;
        geoSatellite.rotation.y = -geoAngle;

        // 3. Moon Orbit around Earth
        const moonAngle = 0.8 + elapsedTime * 0.25;
        moonMesh.position.x = Math.cos(moonAngle) * lunarOrbitRadius;
        moonMesh.position.z = Math.sin(moonAngle) * lunarOrbitRadius;
        moonMesh.rotation.y = elapsedTime * 0.09;

        // Satellite LRO around Moon
        const lroAngle = 0.5 + elapsedTime * 0.85;
        lroSatellite.position.x = Math.cos(lroAngle) * lroOrbitRadius;
        lroSatellite.position.z = Math.sin(lroAngle) * lroOrbitRadius;
        lroSatellite.rotation.y = -lroAngle;

        // 4. Mars Interplanetary Orbit
        const marsAngle = 3.6 + elapsedTime * 0.12;
        marsMesh.position.x = Math.cos(marsAngle) * marsOrbitRadiusX;
        marsMesh.position.z = Math.sin(marsAngle) * marsOrbitRadiusZ;
        marsMesh.rotation.y = elapsedTime * 0.14;

        // Satellite MRO around Mars
        const mroAngle = 2.1 + elapsedTime * 0.78;
        mroSatellite.position.x = Math.cos(mroAngle) * mroOrbitRadius;
        mroSatellite.position.z = Math.sin(mroAngle) * mroOrbitRadius;
        mroSatellite.rotation.y = -mroAngle;
        // Satellite LED Beacons Pulsing
        const pulse = (Math.sin(elapsedTime * 5.0) + 1.0) * 0.5;
        (leoBeacon.material as THREE.MeshBasicMaterial).opacity = 0.4 + pulse * 0.6;
        (geoBeacon.material as THREE.MeshBasicMaterial).opacity = 0.4 + pulse * 0.6;
        (lroBeacon.material as THREE.MeshBasicMaterial).opacity = 0.4 + pulse * 0.6;
        (mroBeacon.material as THREE.MeshBasicMaterial).opacity = 0.4 + pulse * 0.6;

        // Background Starfield Drift
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

      earthGeo.dispose();
      cloudGeo.dispose();
      atmosGeo.dispose();
      moonGeo.dispose();
      marsGeo.dispose();
      marsAtmosGeo.dispose();
      starGeo.dispose();

      earthMat.dispose();
      cloudMat.dispose();
      atmosMat.dispose();
      moonMat.dispose();
      marsMat.dispose();
      marsAtmosMat.dispose();
      starMat.dispose();

      earthTex.dispose();
      earthSpec.dispose();
      earthNight.dispose();
      cloudTex.dispose();
      moonTex.dispose();
      marsTex.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#07090E]">
      {/* 3D WebGL Canvas */}
      {webGlAvailable ? (
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full cursor-grab z-0"
          aria-label="Interactive 3D orbit system with Earth, Moon, Mars, and orbital satellites"
        />
      ) : (
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
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full px-3.5 py-2 rounded-xl bg-[#0E1523]/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl text-left transition-all duration-75"
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
            <span className="text-slate-400">Live Orbit Telemetry</span>
          </div>
        </div>
      )}

      {/* Top Banner & Simulation Control */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-400 tracking-widest uppercase pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-bold text-white tracking-widest">XORA</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 tracking-wider">Active Planetary Orbit Simulation</span>
        </div>

        <div className="text-[11px] font-mono text-slate-300 pointer-events-auto flex items-center gap-3 bg-[#0B0F17]/90 px-3 py-1.5 rounded-full border border-slate-800/80 backdrop-blur-md shadow-sm">
          <span className="hidden sm:inline text-slate-400">4 Satellites in Orbit</span>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs text-cyan-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isRotating ? 'Pause orbital motion' : 'Resume orbital motion'}
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
        <div className="max-w-xs sm:max-w-sm space-y-3 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-[11px] font-mono text-cyan-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Planetary Analog Atlas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-widest text-white leading-none uppercase font-sans">
            XORA
          </h1>

          <div className="text-sm sm:text-base font-mono tracking-wider font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
            EARTH · MOON · MARS
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-xs sm:max-w-sm pt-1">
            Discover Earth&apos;s hidden terrain analogs. Calibrated proving grounds benchmarked for humanity&apos;s next worlds.
          </p>
        </div>
      </div>

      {/* Subtle Bottom Orbit Telemetry Indicator Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-6 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Earth · Moon · Mars</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="hidden sm:inline text-slate-400">Continuous Multi-Body Orbital Mechanics</span>
        </div>
        <div className="text-slate-400 text-[10px]">
          Drag canvas to rotate 3D view
        </div>
      </div>
    </div>
  );
};
