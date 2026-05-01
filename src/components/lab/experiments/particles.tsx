"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Particles — a CPU-driven 2D particle field with curl-noise drift.
 *
 * Each particle wanders along a procedural flow field. Mouse position adds a
 * radial impulse. Rendered as POINTS so we can keep ~12k particles cheap.
 */
export function ParticlesExperiment() {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "var(--color-paper)" }}
    >
      <Field />
    </Canvas>
  );
}

function Field() {
  const COUNT = 12000;
  const ref = useRef<THREE.Points>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    pointer.current.set(state.pointer.x * 2, state.pointer.y * 2);
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime * 0.4;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      let x = arr[ix];
      let y = arr[ix + 1];

      // Cheap pseudo-curl: sin/cos of position with time offset
      const fx = Math.sin(y * 1.4 + t) - Math.cos(x * 0.7 + t * 0.6);
      const fy = Math.cos(x * 1.2 - t) - Math.sin(y * 0.9 - t * 0.5);

      // Pointer attraction
      const dx = pointer.current.x - x;
      const dy = pointer.current.y - y;
      const d2 = dx * dx + dy * dy + 0.05;
      const pull = 0.6 / d2;

      let vx = velocities[i * 2 + 0];
      let vy = velocities[i * 2 + 1];
      vx = vx * 0.92 + (fx + dx * pull) * dt * 0.6;
      vy = vy * 0.92 + (fy + dy * pull) * dt * 0.6;
      velocities[i * 2 + 0] = vx;
      velocities[i * 2 + 1] = vy;

      x += vx * dt;
      y += vy * dt;

      // Wrap around
      if (x > 2.2) x = -2.2;
      if (x < -2.2) x = 2.2;
      if (y > 2.2) y = -2.2;
      if (y < -2.2) y = 2.2;

      arr[ix] = x;
      arr[ix + 1] = y;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#1c39ff" transparent opacity={0.85} />
    </points>
  );
}
