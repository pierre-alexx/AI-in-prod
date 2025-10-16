"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState, useId } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function StepCard({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <div className="relative p-10 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-lg text-white w-[22rem] text-center">
      <div className="mx-auto mb-5 w-20 h-20">{icon}</div>
      <h3 className="font-semibold text-xl" style={{ fontFamily: 'SentinelMedium, ui-sans-serif, system-ui' }}>{title}</h3>
      <p className="mt-3 text-base text-white/70" style={{ fontFamily: 'SentinelBook, ui-sans-serif, system-ui' }}>{desc}</p>
    </div>
  );
}

function StartIcon3D() {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    t.current += 0.02;
    g.position.y = Math.sin(t.current) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Bubbly cross using rounded capsules */}
      <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.18, 0.64, 16, 32]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.18} roughness={0.14} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.8} emissive="#ffffff" emissiveIntensity={0.14} />
      </mesh>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.64, 16, 32]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.18} roughness={0.14} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.8} emissive="#ffffff" emissiveIntensity={0.14} />
      </mesh>
    </group>
  );
}

function CloudIcon3D() {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    t.current += 0.02;
    g.position.y = Math.sin(t.current) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Cloud composed of soft overlapping spheres (front-left, top-center, front-right, bottom-center) */}
      <mesh castShadow receiveShadow position={[-0.32, 0.0, 0]}>
        <sphereGeometry args={[0.30, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} metalness={0.06} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} emissive="#ffffff" emissiveIntensity={0.10} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.16, -0.02]}>
        <sphereGeometry args={[0.40, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} metalness={0.06} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} emissive="#ffffff" emissiveIntensity={0.10} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.34, 0.0, 0]}>
        <sphereGeometry args={[0.30, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} metalness={0.06} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} emissive="#ffffff" emissiveIntensity={0.10} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.10, 0.02]}>
        <sphereGeometry args={[0.26, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} metalness={0.06} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} emissive="#ffffff" emissiveIntensity={0.10} />
      </mesh>
    </group>
  );
}

function InspirationBulb3D() {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    t.current += 0.02;
    g.position.y = Math.sin(t.current) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.1} transmission={0.6} thickness={0.6} clearcoat={1} clearcoatRoughness={0.02} emissive="#ffffff" emissiveIntensity={0.18} envMapIntensity={1.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.22, 24]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.15} roughness={0.18} clearcoat={1} clearcoatRoughness={0.04} emissive="#ffffff" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, -0.26, 0]}>
        <torusGeometry args={[0.2, 0.02, 16, 48]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.14} metalness={0.1} clearcoat={1} clearcoatRoughness={0.03} emissive="#ffffff" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

function CreateIcon3D() {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    t.current += 0.02;
    g.position.y = Math.sin(t.current) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Bubbly heart built from rounded primitives */}
      <mesh castShadow receiveShadow position={[-0.22, 0.08, 0]}>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshPhysicalMaterial color="#ffd6de" metalness={0.2} roughness={0.15} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.22, 0.08, 0]}>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshPhysicalMaterial color="#ffd6de" metalness={0.2} roughness={0.15} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} />
      </mesh>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <capsuleGeometry args={[0.22, 0.42, 16, 32]} />
        <meshPhysicalMaterial color="#ffd6de" metalness={0.2} roughness={0.15} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
}

function MiniScene({ variant }: { variant: "start" | "cloud" | "bulb" }) {
  return (
    <Canvas
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 2.2], fov: 45 }}
      dpr={[1, 2]}
      className="w-full h-full"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 2, 3]} intensity={1.6} />
      <directionalLight position={[-2, 1, 1]} intensity={0.6} />
      {variant === "start" && <StartIcon3D />}
      {variant === "cloud" && <CloudIcon3D />}
      {variant === "bulb" && <InspirationBulb3D />}
    </Canvas>
  );
}

function Arrow({ onComplete, active = false }: { onComplete?: () => void; active?: boolean }) {
  const [hasShown, setHasShown] = useState(false);
  const shouldShow = active || hasShown;

  return (
    <motion.div
      style={{ width: 140, height: 60 }}
      initial={{ opacity: 0, y: 20 }}
      animate={shouldShow ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (active && !hasShown) {
          setHasShown(true);
          if (onComplete) onComplete();
        }
      }}
    >
      <img
        src="/white-arrow.png"
        alt="arrow"
        style={{ width: 140, height: 60, objectFit: "contain" }}
      />
    </motion.div>
  );
}

export default function Workflow() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const [sequenceStep, setSequenceStep] = useState<number>(0);
  const [sequenceDone, setSequenceDone] = useState<boolean>(false);

  useEffect(() => {
    if (!inView || sequenceDone || sequenceStep !== 0) return;

    const previousOverflow = document.body.style.overflow;
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Lock scroll
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });

    // Kick off sequence
    setSequenceStep(1);

    return () => {
      // Safety unlock on unmount
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("wheel", preventDefault as any);
      window.removeEventListener("touchmove", preventDefault as any);
    };
  }, [inView, sequenceDone, sequenceStep]);

  useEffect(() => {
    if (!sequenceDone) return;
    // Unlock scroll at the end
    document.body.style.overflow = "";
    // Remove any lingering handlers just in case
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };
    window.removeEventListener("wheel", preventDefault as any);
    window.removeEventListener("touchmove", preventDefault as any);
  }, [sequenceDone]);

  const stepCommon = {
    transition: { duration: 0.4, ease: "easeOut" },
  } as const;

  return (
    <div ref={ref} className="w-full">
      <div ref={containerRef} className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
        {/* Step 1 */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={sequenceStep >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={stepCommon.transition}
          onUpdate={() => {}}
          onAnimationComplete={() => {
            if (sequenceStep === 1) setSequenceStep(2);
          }}
        >
          <StepCard
            title="Upload your image"
            desc="Start with any photo or image. Renoir works with all formats and sizes to bring your vision to life."
            icon={<div className="w-full h-full"><MiniScene variant="start" /></div>}
          />
        </motion.div>

        {/* Arrow 1 (hidden on small screens) */}
        <div className="hidden md:block">
          <Arrow
            key="arrow1"
            active={sequenceStep === 2}
            onComplete={() => {
              if (sequenceStep === 2) setSequenceStep(3);
            }}
          />
        </div>

        {/* Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={sequenceStep >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={stepCommon.transition}
          onAnimationComplete={() => {
            if (sequenceStep === 3) setSequenceStep(4);
          }}
        >
          <StepCard
            title="Describe your vision"
            desc="Tell Renoir what you want to achieve. Enhance, stylize, remove objects, or completely transform your image with simple prompts."
            icon={<div className="w-full h-full"><MiniScene variant="cloud" /></div>}
          />
        </motion.div>

        {/* Arrow 2 (hidden on small screens) */}
        <div className="hidden md:block">
          <Arrow
            key="arrow2"
            active={sequenceStep === 4}
            onComplete={() => {
              if (sequenceStep === 4) setSequenceStep(5);
            }}
          />
        </div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={sequenceStep >= 5 ? { opacity: 1, x: 0 } : {}}
          transition={stepCommon.transition}
          onAnimationComplete={() => {
            if (sequenceStep === 5) {
              setSequenceStep(6);
              setSequenceDone(true);
            }
          }}
        >
          <StepCard
            title="Get your masterpiece"
            desc="Watch as Renoir transforms your image with AI magic. Download high-quality results and iterate until it's perfect."
            icon={<div className="w-full h-full"><MiniScene variant="bulb" /></div>}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ArrowScroll({ pathLengthMV, opacityMV }: { pathLengthMV?: any; opacityMV?: any }) {
  // Deprecated in this refactor (kept to avoid breaking imports elsewhere if any)
  return <div style={{ width: 140, height: 60, opacity: 0 }} />;
}


