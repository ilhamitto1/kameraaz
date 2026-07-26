"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useTexture, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type GearItem = {
  src: string;
  label: string;
  angle: number;
  radius: number;
  y: number;
  scale: number;
  speed: number;
};

const GEAR: GearItem[] = [
  { src: "/brand/gear/gear-camera.png", label: "Mirrorless", angle: -0.55, radius: 2.35, y: 0.55, scale: 1.15, speed: 0.22 },
  { src: "/brand/gear/gear-cinema.png", label: "Cinema", angle: 0.15, radius: 2.55, y: -0.15, scale: 1.05, speed: 0.18 },
  { src: "/brand/gear/gear-lens.png", label: "Lens", angle: 0.75, radius: 2.2, y: 0.85, scale: 0.88, speed: 0.28 },
  { src: "/brand/gear/gear-gimbal.png", label: "Gimbal", angle: -0.95, radius: 2.45, y: -0.75, scale: 0.92, speed: 0.2 },
  { src: "/brand/gear/gear-light.png", label: "Light", angle: 1.15, radius: 2.5, y: -0.55, scale: 0.9, speed: 0.24 },
];

function GearCard({ item }: { item: GearItem }) {
  const tex = useTexture(item.src);
  tex.colorSpace = THREE.SRGBColorSpace;

  const group = useRef<THREE.Group>(null);
  const x = Math.sin(item.angle) * item.radius;
  const z = Math.cos(item.angle) * item.radius - 0.4;

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * item.speed;
    group.current.rotation.y = Math.sin(t) * 0.35 + item.angle * 0.15;
    group.current.rotation.x = Math.cos(t * 0.8) * 0.12;
  });

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2a2e",
        metalness: 0.85,
        roughness: 0.28,
      }),
    [],
  );
  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c8ff00",
        emissive: "#c8ff00",
        emissiveIntensity: 0.35,
        metalness: 0.4,
        roughness: 0.4,
      }),
    [],
  );

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.45}>
      <group position={[x, item.y, z]} scale={item.scale}>
        <group ref={group}>
          {/* Soft plate behind photo */}
          <RoundedBox args={[1.55, 1.55, 0.08]} radius={0.04} smoothness={4} position={[0, 0, -0.06]}>
            <meshStandardMaterial color="#121214" metalness={0.6} roughness={0.35} />
          </RoundedBox>

          {/* Photo plane */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.38, 1.38]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>

          {/* Thin frame edges */}
          <mesh position={[0, 0.72, 0.02]} material={frameMat}>
            <boxGeometry args={[1.5, 0.035, 0.04]} />
          </mesh>
          <mesh position={[0, -0.72, 0.02]} material={frameMat}>
            <boxGeometry args={[1.5, 0.035, 0.04]} />
          </mesh>
          <mesh position={[-0.72, 0, 0.02]} material={frameMat}>
            <boxGeometry args={[0.035, 1.5, 0.04]} />
          </mesh>
          <mesh position={[0.72, 0, 0.02]} material={frameMat}>
            <boxGeometry args={[0.035, 1.5, 0.04]} />
          </mesh>

          {/* Accent corner ticks */}
          <mesh position={[-0.62, 0.62, 0.05]} material={accentMat}>
            <boxGeometry args={[0.18, 0.02, 0.02]} />
          </mesh>
          <mesh position={[-0.62, 0.62, 0.05]} material={accentMat}>
            <boxGeometry args={[0.02, 0.18, 0.02]} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function OrbitRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <pointLight position={[2, 1, 2]} intensity={0.5} color="#c8ff00" />

      <OrbitRig>
        {GEAR.map((item) => (
          <GearCard key={item.src} item={item} />
        ))}
      </OrbitRig>
    </>
  );
}

export function HeroCameras3D() {
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const deskMq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setReduce(motionMq.matches);
      setDesktop(deskMq.matches);
    };
    sync();
    setReady(true);
    motionMq.addEventListener("change", sync);
    deskMq.addEventListener("change", sync);
    return () => {
      motionMq.removeEventListener("change", sync);
      deskMq.removeEventListener("change", sync);
    };
  }, []);

  if (!ready || !desktop) return null;

  if (reduce) {
    return (
      <div className="absolute inset-0 hidden items-center justify-end pr-8 opacity-80 lg:flex">
        <div className="grid max-w-md grid-cols-2 gap-3">
          {GEAR.slice(0, 4).map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={g.src}
              src={g.src}
              alt={g.label}
              className="aspect-square rounded-sm border border-white/10 object-cover"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
      <Canvas
        camera={{ position: [0.2, 0.15, 6.2], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-transparent to-transparent" />
    </div>
  );
}
