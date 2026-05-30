"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { colors, toVec3 } from "@humanberto/ui";
import { fragmentShader, vertexShader } from "./shader";

function vec3(hex: string) {
  return new THREE.Vector3(...toVec3(hex));
}

function FluidPlane({ intensity }: { intensity: number }) {
  const { viewport, size } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: intensity },
      uInk: { value: vec3(colors.ink) },
      uPurpleDeep: { value: vec3(colors.purpleDeep) },
      uPurple: { value: vec3(colors.purple) },
      uGold: { value: vec3(colors.gold) },
      uGoldBright: { value: vec3(colors.goldBright) },
    }),
    // Uniforms are mutated imperatively in useFrame; create once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);

    const aspect = size.width / Math.max(size.height, 1);
    const targetX = state.pointer.x * 0.5 * aspect;
    const targetY = state.pointer.y * 0.5;
    pointer.current.x += (targetX - pointer.current.x) * 0.05;
    pointer.current.y += (targetY - pointer.current.y) * 0.05;
    uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function LivingScene({ intensity = 1 }: { intensity?: number }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0, 1], fov: 50 }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <color attach="background" args={[colors.ink]} />
      <FluidPlane intensity={intensity} />
    </Canvas>
  );
}
