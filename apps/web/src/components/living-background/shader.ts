export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uIntensity;
  uniform vec3 uInk;
  uniform vec3 uPurpleDeep;
  uniform vec3 uPurple;
  uniform vec3 uGold;
  uniform vec3 uGoldBright;

  // Ashima simplex noise 2D
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uResolution.x / max(uResolution.y, 1.0);

    float t = uTime * 0.05; // slow, thick movement

    // --- Layer 1: domain-warped thick liquid -------------------------------
    vec2 q = vec2(
      fbm(p * 1.4 + vec2(0.0, t)),
      fbm(p * 1.4 + vec2(5.2, 1.3 - t))
    );
    vec2 r = vec2(
      fbm(p * 1.4 + 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p * 1.4 + 2.0 * q + vec2(8.3, 2.8) - 0.126 * t)
    );
    float fluid = fbm(p * 1.4 + 2.5 * r);

    float f = smoothstep(-0.6, 0.8, fluid);
    vec3 col = mix(uInk, uPurpleDeep, f);
    col = mix(col, uPurple * 0.55, smoothstep(0.35, 1.0, f) * 0.5);

    // --- Layer 2: suspended gold dust --------------------------------------
    float dustField = fbm(p * 8.0 + r * 1.5 + vec2(t * 0.5));
    float sparkle = pow(max(0.0, snoise(p * 62.0 + r * 4.0 + t * 2.0)), 12.0);
    col += uGold * sparkle * 0.7 * smoothstep(0.2, 0.9, dustField);

    // --- Layer 3: organic gold circuits / lightning veins ------------------
    vec2 cp = p * 2.0 + 1.5 * r; // route the veins through the liquid
    float veins = 0.0;
    float amp = 1.0;
    for (int i = 0; i < 3; i++) {
      float n = snoise(cp);
      float ridge = 1.0 - abs(n);
      ridge = pow(ridge, 18.0); // thin, bright filaments
      veins += ridge * amp;
      cp = cp * 1.9 + vec2(t * 0.3, -t * 0.2);
      amp *= 0.6;
    }
    float flicker = 0.72 + 0.28 * sin(uTime * 3.0 + fluid * 6.0);
    vec3 veinColor = mix(uGold, uGoldBright, clamp(veins, 0.0, 1.0));
    col += veinColor * veins * flicker * uIntensity * 0.6;

    // --- Pointer warmth ----------------------------------------------------
    vec2 pd = p - uPointer;
    float glow = exp(-dot(pd, pd) * 3.0);
    col += uGold * glow * 0.12;

    // --- Grade -------------------------------------------------------------
    float vig = smoothstep(1.35, 0.2, length(p));
    col *= vig;
    col = col / (col + 0.6);          // soft filmic compression
    col = pow(col, vec3(0.85));       // lift mids

    gl_FragColor = vec4(col, 1.0);
  }
`;
