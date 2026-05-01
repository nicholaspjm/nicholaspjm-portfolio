/**
 * Fragment shader for the home hero.
 *
 * A domain-warped fbm noise field rendered as topographic isobands. The mouse
 * pulls and pushes the warp, so moving the cursor stretches the contour lines
 * like wind blowing through ink. Output is monochromatic — paper-ground with
 * a single blue ink — to fit the publication aesthetic.
 *
 * Uniforms:
 *   uTime       — seconds since mount
 *   uResolution — viewport pixel size
 *   uMouse      — normalized mouse position [-1, 1] on each axis
 *   uPaper      — paper / ground color (rgb)
 *   uInk        — line / ink color (rgb)
 */

export const heroVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const heroFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform vec3  uPaper;
  uniform vec3  uInk;

  // ----- Hash + value noise (Inigo Quilez style) ---------------------------
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    // Time + mouse pull
    float t = uTime * 0.08;
    vec2 m = uMouse * 0.6;

    // First domain warp — large structure
    vec2 q = vec2(
      fbm(p + vec2(0.0, t) + m * 0.4),
      fbm(p + vec2(5.2, 1.3) - m * 0.4)
    );
    // Second warp — finer wrinkles
    vec2 r = vec2(
      fbm(p + 2.0 * q + vec2(1.7, 9.2) + t),
      fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.7)
    );
    float n = fbm(p + 2.0 * r);

    // Topographic isobands — repeated stripes of the field
    float bands = 14.0;
    float band = abs(fract(n * bands - 0.5) - 0.5) * 2.0;
    // Sharp lines via smoothstep
    float line = smoothstep(0.05, 0.0, band);

    // Soft halo near mouse — a faint glow that follows the cursor
    float halo = smoothstep(0.55, 0.0, length(p - uMouse * aspect * 0.5));
    halo *= 0.08;

    // Compose
    vec3 col = mix(uPaper, uInk, line + halo);

    // Subtle vignette
    float v = smoothstep(1.4, 0.5, length(p));
    col = mix(uPaper, col, 0.6 + 0.4 * v);

    gl_FragColor = vec4(col, 1.0);
  }
`;
