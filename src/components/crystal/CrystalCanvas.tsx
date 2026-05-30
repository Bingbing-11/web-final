import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import { hslToHex } from '../../lib/crystal/colorEngine';
import type { SceneWeights } from '../../types/crystal';
import { getPrimaryScene, getAccentScenes, SCENE_TEMPLATES } from '../../lib/crystal/sceneEngine';
import styles from './CrystalCanvas.module.css';

function SceneGeometry({ geometryType, colors, scale = 1 }: { geometryType: string; colors: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  const color = new THREE.Color(...colors);
  const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });

  switch (geometryType) {
    case 'cone': return <mesh ref={meshRef} scale={scale} material={mat}><coneGeometry args={[0.5, 1, 32]} /></mesh>;
    case 'sphere': return <mesh ref={meshRef} scale={scale} material={mat}><sphereGeometry args={[0.4, 32, 32]} /></mesh>;
    case 'torus': return <mesh ref={meshRef} scale={scale} material={mat}><torusGeometry args={[0.3, 0.1, 16, 32]} /></mesh>;
    default: return <mesh ref={meshRef} scale={scale} material={mat} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.8, 0.8]} /></mesh>;
  }
}

function SceneParticles({ color, count = 30 }: { color: [number, number, number]; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 1.2;
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.1;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={new THREE.Color(...color)} size={0.03} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function InnerScene({ sceneWeights }: { sceneWeights: SceneWeights }) {
  const primary = getPrimaryScene(sceneWeights);
  const accents = getAccentScenes(sceneWeights);
  if (!primary) return null;
  return (
    <group>
      <SceneGeometry geometryType={primary.geometry} colors={primary.colors} />
      <SceneParticles color={primary.particleColor} count={40} />
      {accents.map((s, i) => (
        <group key={s.id}>
          <SceneGeometry geometryType={s.geometry} colors={s.colors} scale={0.6} />
          <SceneParticles color={s.particleColor} count={15} />
          <group position={[0.3 * (i + 1), -0.2 * i, 0]} />
        </group>
      ))}
    </group>
  );
}

function CrystalOrb({ params, isSealed }: { params: typeof DEFAULT_CRYSTAL_PARAMS; isSealed?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current && !isSealed) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      const s = 1 + Math.sin(state.clock.elapsedTime * params.breatheSpeed) * params.breatheAmplitude;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color={hslToHex(params.hue, params.saturation, params.lightness)}
        roughness={isSealed ? 0.4 : params.roughness}
        metalness={params.metalness}
        clearcoat={params.clearcoat}
        transmission={isSealed ? 0.1 : params.transmission}
        thickness={params.thickness}
        ior={params.ior}
        transparent
        opacity={params.opacity}
        envMapIntensity={params.envIntensity}
      />
    </mesh>
  );
}

function CrystalParticles({ count, speed }: { count: number; speed: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.3 + Math.random() * 0.5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * speed;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#A29BFE" size={0.02} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </points>
  );
}

interface Props {
  params?: Partial<typeof DEFAULT_CRYSTAL_PARAMS>;
  sceneWeights?: SceneWeights;
  isSealed?: boolean;
}

export default function CrystalCanvas({ params, sceneWeights, isSealed }: Props) {
  const merged = { ...DEFAULT_CRYSTAL_PARAMS, ...params };
  return (
    <div className={styles.container}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -3, 3]} intensity={0.4} color="#A29BFE" />
        <CrystalOrb params={merged} isSealed={isSealed} />
        {sceneWeights && Object.keys(sceneWeights).length > 0 && (
          <InnerScene sceneWeights={sceneWeights} />
        )}
        {!isSealed && <CrystalParticles count={merged.particleCount} speed={merged.particleSpeed} />}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
