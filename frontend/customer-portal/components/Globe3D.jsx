'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const nodes = [
  { id: 'b2b', label: 'B2B', stat: '24/7 Trade', lat: 14, lon: 18, color: '#22d3ee' },
  { id: 'tesbinn', label: 'Tesbinn', stat: 'Learning Hub', lat: 34, lon: 140, color: '#818cf8' },
  { id: 'enisra', label: 'Enisra', stat: 'AI Matching', lat: -6, lon: 82, color: '#38bdf8' },
  { id: 'expo', label: 'Expo', stat: 'Global Reach', lat: -28, lon: -44, color: '#60a5fa' },
  { id: 'tv', label: 'TV', stat: 'Media Layer', lat: 44, lon: -128, color: '#a78bfa' },
  { id: 'buna', label: 'Buna', stat: 'Coffee Brand', lat: -30, lon: 156, color: '#2dd4bf' },
];

const links = [
  ['b2b', 'enisra'],
  ['b2b', 'expo'],
  ['tesbinn', 'tv'],
  ['tesbinn', 'buna'],
  ['enisra', 'expo'],
  ['expo', 'tv'],
  ['tv', 'buna'],
];

function latLonToVector(lat, lon, radius = 2.15) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function buildArc(start, end, lift = 0.7) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const peak = mid.clone().normalize().multiplyScalar(mid.length() + lift);
  const curve = new THREE.QuadraticBezierCurve3(start, peak, end);
  return curve.getPoints(48);
}

function StarField() {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const values = [];
    for (let i = 0; i < 900; i += 1) {
      const radius = 12 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      values.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(values);
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#9bdcff" size={0.055} sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}

function OrbitRing({ radius, color, rotation, opacity }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.014, 16, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function ArcLine({ points, active }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={active ? '#67e8f9' : '#6366f1'} transparent opacity={active ? 0.95 : 0.28} />
    </line>
  );
}

function TradePulse({ points, active }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const speed = active ? 0.45 : 0.22;
    const progress = (clock.getElapsedTime() * speed) % 1;
    const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
    ref.current.position.copy(points[index]);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[active ? 0.055 : 0.035, 16, 16]} />
      <meshStandardMaterial
        color={active ? '#a5f3fc' : '#60a5fa'}
        emissive={active ? '#22d3ee' : '#4f46e5'}
        emissiveIntensity={active ? 3 : 1.3}
      />
    </mesh>
  );
}

function NodeMarker({ node, isActive, onSelect }) {
  const haloRef = useRef(null);
  const dotRef = useRef(null);

  useFrame(({ clock }) => {
    const pulse = isActive ? 1.45 + Math.sin(clock.elapsedTime * 2.2) * 0.12 : 1.1;
    if (haloRef.current) {
      haloRef.current.position.copy(node.position);
      haloRef.current.scale.setScalar(pulse);
    }
    if (dotRef.current) {
      dotRef.current.position.copy(node.position);
      dotRef.current.scale.setScalar(isActive ? 1.16 : 1);
    }
  });

  return (
    <group>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshBasicMaterial
          color={isActive ? '#67e8f9' : node.color}
          transparent
          opacity={isActive ? 0.22 : 0.08}
        />
      </mesh>
      <mesh ref={dotRef} onClick={onSelect}>
        <sphereGeometry args={[isActive ? 0.11 : 0.082, 24, 24]} />
        <meshStandardMaterial
          color={isActive ? '#a5f3fc' : node.color}
          emissive={isActive ? '#22d3ee' : node.color}
          emissiveIntensity={isActive ? 2.8 : 1.5}
          roughness={0.2}
          metalness={0.35}
        />
      </mesh>
    </group>
  );
}

function Scene({ activeNode, onNodeSelect }) {
  const rigRef = useRef(null);

  const mappedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        position: latLonToVector(node.lat, node.lon),
      })),
    []
  );

  const arcData = useMemo(
    () =>
      links.map(([from, to]) => {
        const startNode = mappedNodes.find((node) => node.id === from);
        const endNode = mappedNodes.find((node) => node.id === to);

        return {
          id: `${from}-${to}`,
          from,
          to,
          points: buildArc(startNode.position, endNode.position),
        };
      }),
    [mappedNodes]
  );

  useFrame((state, delta) => {
    if (!rigRef.current) return;

    rigRef.current.rotation.y += delta * 0.14;
    rigRef.current.rotation.x = THREE.MathUtils.lerp(rigRef.current.rotation.x, state.pointer.y * 0.14, 0.03);
    rigRef.current.rotation.z = THREE.MathUtils.lerp(rigRef.current.rotation.z, -state.pointer.x * 0.08, 0.03);
  });

  return (
    <group ref={rigRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial
          color="#071224"
          emissive="#0f3b6d"
          emissiveIntensity={0.58}
          roughness={0.36}
          metalness={0.42}
          clearcoat={0.9}
          clearcoatRoughness={0.16}
          transparent
          opacity={0.96}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.03, 48, 48]} />
        <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.08} />
      </mesh>

      <mesh scale={1.35}>
        <sphereGeometry args={[2.05, 48, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      <OrbitRing radius={2.45} color="#818cf8" rotation={[Math.PI / 2.3, 0.2, 0]} opacity={0.35} />
      <OrbitRing radius={2.68} color="#22d3ee" rotation={[0.75, 0.52, 0]} opacity={0.22} />

      {arcData.map((arc) => {
        const active = activeNode === arc.from || activeNode === arc.to;

        return (
          <group key={arc.id}>
            <ArcLine points={arc.points} active={active} />
            <TradePulse points={arc.points} active={active} />
          </group>
        );
      })}

      {mappedNodes.map((node) => (
        <NodeMarker
          key={node.id}
          node={node}
          isActive={activeNode === node.id}
          onSelect={() => onNodeSelect?.(node.id)}
        />
      ))}
    </group>
  );
}

export default function Globe3D({ activeNode = 'b2b', onNodeSelect }) {
  const [stats, setStats] = useState({
    platforms: 6,
    uptime: 24,
    reach: 360,
  });

  const currentNode = nodes.find((node) => node.id === activeNode) || nodes[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        platforms: 6,
        uptime: prev.uptime === 24 ? 25 : 24,
        reach: prev.reach >= 360 ? 356 : prev.reach + 1,
      }));
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[560px] overflow-visible">
      <div className="absolute inset-0 rounded-[2.2rem] bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.18),rgba(15,23,42,0)_52%),linear-gradient(180deg,rgba(8,14,28,0.38),rgba(8,14,28,0.05))]" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="absolute top-[11%] left-[2%] hero-glass px-4 py-3 rounded-2xl z-20">
        <p className="hero-eyebrow">Live Grid</p>
        <p className="text-white font-bold text-sm">{stats.platforms} Platforms</p>
      </div>

      <div className="absolute top-[16%] right-[3%] hero-glass px-4 py-3 rounded-2xl z-20">
        <p className="hero-eyebrow">Reach</p>
        <p className="text-white font-bold text-sm">{stats.reach} deg Network</p>
      </div>

      <div className="absolute bottom-[13%] left-[4%] hero-glass px-4 py-3 rounded-2xl z-20">
        <p className="hero-eyebrow">Status</p>
        <p className="text-white font-bold text-sm">{stats.uptime}/7 Active</p>
      </div>

      <div className="absolute bottom-[10%] right-[4%] hero-panel px-4 py-4 rounded-[1.4rem] z-20 max-w-[210px]">
        <p className="hero-eyebrow">Focused Platform</p>
        <p className="text-white font-black text-base mt-1">{currentNode.label}</p>
        <p className="text-slate-300 text-sm mt-1 leading-6">{currentNode.stat}</p>
      </div>

      <Canvas camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 8.5, 14]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 5, 6]} intensity={2.2} color="#c4b5fd" />
        <pointLight position={[-5, -3, 3]} intensity={2.4} color="#22d3ee" />
        <pointLight position={[0, 0, -5]} intensity={1.1} color="#1d4ed8" />
        <StarField />
        <Scene activeNode={activeNode} onNodeSelect={onNodeSelect} />
      </Canvas>

      <style jsx>{`
        .hero-glass {
          background: rgba(8, 14, 28, 0.64);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
        }

        .hero-panel {
          background: linear-gradient(180deg, rgba(8, 14, 28, 0.8), rgba(8, 14, 28, 0.55));
          border: 1px solid rgba(103, 232, 249, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.26);
        }

        .hero-eyebrow {
          color: #67e8f9;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
