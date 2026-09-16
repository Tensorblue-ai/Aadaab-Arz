'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const SCENE_COLORS = ['#c98a37', '#f4c36b', '#d79b44', '#e2a64c', '#b77b2e', '#efb94f', '#f1ca76'];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function GoldenDust({ activeScene }: { activeScene: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const random = seededRandom(1911);
    const values = new Float32Array(210 * 3);
    for (let index = 0; index < 210; index += 1) {
      const stride = index * 3;
      values[stride] = (random() - 0.5) * 13;
      values[stride + 1] = (random() - 0.5) * 8;
      values[stride + 2] = (random() - 0.5) * 5;
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.018;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.035;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.18 + activeScene) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={SCENE_COLORS[activeScene]}
        size={0.032}
        sizeAttenuation
        transparent
        opacity={0.68}
        depthWrite={false}
      />
    </points>
  );
}

function ArchPortal({
  activeScene,
  pointerRef,
}: {
  activeScene: number;
  pointerRef: { current: { x: number; y: number } };
}) {
  const archRef = useRef<THREE.Group>(null);
  const targetRotation = (activeScene % 3 - 1) * 0.035;

  useFrame(() => {
    if (!archRef.current) return;
    archRef.current.rotation.y = THREE.MathUtils.lerp(
      archRef.current.rotation.y,
      targetRotation + pointerRef.current.x * 0.035,
      0.035,
    );
    archRef.current.rotation.x = THREE.MathUtils.lerp(
      archRef.current.rotation.x,
      pointerRef.current.y * -0.025,
      0.035,
    );
    archRef.current.position.z = THREE.MathUtils.lerp(
      archRef.current.position.z,
      -0.3 + (activeScene % 2) * 0.18,
      0.025,
    );
  });

  return (
    <group ref={archRef} position={[0, -0.05, -0.3]}>
      {[1, 0.82, 0.66].map((scale, index) => (
        <group key={scale} scale={scale} position={[0, index * 0.08, index * -0.08]}>
          <mesh position={[0, -0.35, 0]}>
            <torusGeometry args={[2.85, 0.018, 8, 96, Math.PI]} />
            <meshBasicMaterial
              color={SCENE_COLORS[activeScene]}
              transparent
              opacity={0.34 - index * 0.07}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[-2.85, -1.75, 0]}>
            <boxGeometry args={[0.035, 2.8, 0.035]} />
            <meshBasicMaterial color={SCENE_COLORS[activeScene]} transparent opacity={0.25} />
          </mesh>
          <mesh position={[2.85, -1.75, 0]}>
            <boxGeometry args={[0.035, 2.8, 0.035]} />
            <meshBasicMaterial color={SCENE_COLORS[activeScene]} transparent opacity={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function AtmosphereCanvas({ activeScene }: { activeScene: number }) {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointer);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 6], fov: 46 }}
      dpr={[1, 1.45]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <GoldenDust activeScene={activeScene} />
      <ArchPortal activeScene={activeScene} pointerRef={pointerRef} />
    </Canvas>
  );
}
