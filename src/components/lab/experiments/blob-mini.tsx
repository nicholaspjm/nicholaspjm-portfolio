"use client";

// Small variant of the home hero shader — same domain-warped fbm, but with
// the time scale doubled and fewer bands so it reads as a different piece.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
  float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5;} return v; }
  void main(){
    vec2 uv=vUv; vec2 ar=vec2(uResolution.x/uResolution.y,1.); vec2 p=(uv-.5)*ar;
    float t=uTime*.18; vec2 m=uMouse*.7;
    vec2 q=vec2(fbm(p+vec2(0,t)+m*.6),fbm(p+vec2(5.2,1.3)-m*.6));
    float n=fbm(p+2.0*q);
    float bands=8.0;
    float band=abs(fract(n*bands-.5)-.5)*2.;
    float line=smoothstep(.08,0.,band);
    vec3 col=mix(uPaper,uInk,line);
    gl_FragColor=vec4(col,1.0);
  }
`;

export function BlobMiniExperiment() {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
    >
      <Plane />
    </Canvas>
  );
}

function Plane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());
  const { viewport } = useThree();

  const colors = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        paper: new THREE.Color("#f4f1e8"),
        ink: new THREE.Color("#1c39ff"),
      };
    }
    const root = getComputedStyle(document.documentElement);
    return {
      paper: new THREE.Color(
        root.getPropertyValue("--color-paper").trim() || "#f4f1e8",
      ),
      ink: new THREE.Color(
        root.getPropertyValue("--color-link").trim() || "#1c39ff",
      ),
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2() },
      uPaper: { value: colors.paper },
      uInk: { value: colors.ink },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    if (!matRef.current) return;
    target.current.set(state.pointer.x, state.pointer.y);
    mouse.current.lerp(target.current, Math.min(1, delta * 4));
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
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  );
}
