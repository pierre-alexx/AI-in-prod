"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, MutableRefObject } from "react";
import * as THREE from "three";

function FloatingShape({
  shapeType,
  position,
  index,
  color,
  onReady,
  offsetRef,
  offsetIndex,
}: {
  shapeType: string;
  position: [number, number, number];
  index: number;
  color?: string;
  onReady?: (group: THREE.Group | null) => void;
  offsetRef?: MutableRefObject<THREE.Vector3[]>;
  offsetIndex?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  // Apple-style palette
  const LIGHT = "#f5f7fa"; // soft white
  const LIGHT_ALT = "#e9ecf1"; // light grey
  const BLACK = "#0a0a0a"; // deep black for torus

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    time.current += 0.01;

    // Floating orbital motion
    const offset = index * Math.PI * 0.7;
    const radius = 1.5 + index * 0.4;

    const baseX = position[0] + Math.sin(time.current * 0.3 + offset) * radius;
    const baseY = position[1] + Math.cos(time.current * 0.4 + offset) * radius;
    const baseZ = position[2] + Math.sin(time.current * 0.25 + offset) * 1.2;

    const off = offsetRef && typeof offsetIndex === "number" ? offsetRef.current[offsetIndex] : undefined;
    const ox = off?.x ?? 0;
    const oy = off?.y ?? 0;
    const oz = off?.z ?? 0;

    group.position.set(baseX + ox, baseY + oy, baseZ + oz);

    // Subtle organic rotation
    group.rotation.y += 0.004 + index * 0.0015;
    group.rotation.x += 0.003 + index * 0.001;
    group.rotation.z += Math.sin(time.current * 0.1 + offset) * 0.002;
  });

  const renderShape = () => {
    switch (shapeType) {
      case "orb": {
        return (
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial
              color={LIGHT}
              roughness={0.08}
              metalness={0.25}
              transmission={0.5}
              thickness={1.0}
              clearcoat={1}
              clearcoatRoughness={0.03}
              envMapIntensity={2.2}
              emissive={LIGHT}
              emissiveIntensity={0.03}
            />
          </mesh>
        );
      }

      case "blob": {
        return (
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[1.2, 3]} />
            <meshPhysicalMaterial
              color={LIGHT_ALT}
              roughness={0.12}
              metalness={0.2}
              transmission={0.6}
              thickness={1.0}
              clearcoat={1}
              clearcoatRoughness={0.03}
              envMapIntensity={2}
              emissive={LIGHT}
              emissiveIntensity={0.02}
            />
          </mesh>
        );
      }

      case "torus": {
        return (
          <mesh castShadow receiveShadow>
            <torusGeometry args={[1, 0.35, 32, 64]} />
            <meshPhysicalMaterial
              color={color ?? BLACK}
              metalness={0.6}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={2.5}
            />
          </mesh>
        );
      }

      default:
        return null;
    }
  };

  useEffect(() => {
    onReady?.(groupRef.current);
  }, [onReady]);

  return (
    <group ref={groupRef} position={position}>
      {renderShape()}
    </group>
  );
}

export default function HeroScene() {
  const count = 8; // Reduced from 12 to 8 for better performance
  const shapes = Array.from({ length: count }, () => "torus");
  // Palette: black, white, light grey (Apple-style)
  const COLORS = ["#0a0a0a", "#f5f7fa", "#e9ecf1"] as const;
  const positions: [number, number, number][] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const baseRadius = 4.2;
    const radiusJitter = 0.8 * Math.sin(i * 1.3);
    const r = baseRadius + radiusJitter;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle * 0.85) * 3.2;
    const z = -1.5 + Math.cos(angle * 1.7) * 0.8;
    return [x, y, z];
  });

  const refs = useRef<(THREE.Group | null)[]>([]);
  const separationOffsets = useRef<THREE.Vector3[]>(
    Array.from({ length: count }, () => new THREE.Vector3())
  );

  function CollisionController({
    objects,
    offsets,
  }: {
    objects: React.MutableRefObject<(THREE.Group | null)[]>;
    offsets: React.MutableRefObject<THREE.Vector3[]>;
  }) {
    useFrame(() => {
      const groups = objects.current;
      const offs = offsets.current;
      const n = groups.length;
      if (n < 2) return;

      // Approximate torus as sphere with radius major + tube
      const torusRadius = 1 + 0.35;
      const minDist = torusRadius * 2 * 0.98; // small slack for aesthetics
      const stiffness = 0.25; // how strongly to separate
      const damping = 0.9; // reduce jitter on offsets

      for (let i = 0; i < n; i++) {
        const gi = groups[i];
        if (!gi) continue;
        for (let j = i + 1; j < n; j++) {
          const gj = groups[j];
          if (!gj) continue;
          const a = gi.position.clone();
          const b = gj.position.clone();
          const delta = new THREE.Vector3().subVectors(b, a);
          const dist = delta.length();
          if (dist > 0 && dist < minDist) {
            const penetration = (minDist - dist);
            const dir = delta.multiplyScalar(1 / dist);
            const push = penetration * stiffness;
            offs[i].addScaledVector(dir, -push);
            offs[j].addScaledVector(dir, push);
          }
        }
      }

      // Dampen offsets to avoid drift and jitter
      for (let k = 0; k < n; k++) {
        offs[k].multiplyScalar(damping);
        // Clamp to a reasonable limit to avoid runaway offsets
        const maxOffset = 2.5;
        if (offs[k].length() > maxOffset) {
          offs[k].setLength(maxOffset);
        }
      }
    });

    return null;
  }

  return (
    <Canvas
      className="h-full w-full"
      gl={{
        antialias: false, // Disabled for better performance
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{
        position: [0, 0, 10],
        fov: 60,
        near: 0.1,
        far: 1000,
      }}
      dpr={[0.5, 1]} // Reduced DPR for better performance
      performance={{
        min: 0.5, // Allow frame drops for better performance
      }}
    >
      {/* Ensure black clear color when opaque */}
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-5, 5, 3]} intensity={0.8} />
      <pointLight position={[0, 0, 10]} intensity={1.5} />
      <spotLight
        position={[5, 5, 8]}
        intensity={2}
        angle={0.3}
        penumbra={0.5}
        castShadow
      />

      {shapes.map((shape, index) => (
        <FloatingShape
          key={index}
          shapeType={shape}
          position={positions[index]}
          index={index}
          color={COLORS[index % 3]}
          onReady={(g) => {
            refs.current[index] = g;
          }}
          offsetRef={separationOffsets}
          offsetIndex={index}
        />
      ))}

      <CollisionController objects={refs} offsets={separationOffsets} />
    </Canvas>
  );
}
