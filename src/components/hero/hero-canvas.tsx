"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { heroFragment, heroVertex } from "./shaders/hero.glsl";

/**
 * Full-bleed reactive shader plane. Fills its parent and reads the cursor.
 * Designed to run on its own — wrap in a sized container.
 */
export function HeroCanvas() {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1] }}
    >
      <Plane />
    </Canvas>
  );
}

function Plane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouse = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();

  // Read paper / ink CSS custom properties at mount, falling back to literals.
  const colors = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        paper: new THREE.Color("#f4f1e8"),
        ink: new THREE.Color("#1c39ff"),
      };
    }
    const root = getComputedStyle(document.documentElement);
    const paperHex = root.getPropertyValue("--color-paper").trim() || "#f4f1e8";
    const inkHex = root.getPropertyValue("--color-link").trim() || "#1c39ff";
    return {
      paper: new THREE.Color(paperHex),
      ink: new THREE.Color(inkHex),
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPaper: { value: colors.paper },
      uInk: { value: colors.ink },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    if (!matRef.current) return;
    // Track pointer in normalized [-1, 1] coords.
    mouseTarget.current.set(state.pointer.x, state.pointer.y);
    mouse.current.lerp(mouseTarget.current, Math.min(1, delta * 4));

    const u = matRef.current.uniforms;
    u.uTime.value += delta;
    u.uMouse.value.copy(mouse.current);
    u.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={heroVertex}
        fragmentShader={heroFragment}
      />
    </mesh>
  );
}
