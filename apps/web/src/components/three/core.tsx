"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Fallback } from "./fallback";
import { createPortal } from "react-dom";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
function Sculpture({
  reduced,
  finalActive,
}: {
  reduced: boolean;
  finalActive: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const ribs = useRef<THREE.Group>(null);
  const aim = useRef(new THREE.Vector2());
  const progress = useRef({ value: 0 });
  const reunion = useRef({ value: 1 });
  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) =>
      aim.current.set(
        (e.clientX / innerWidth - 0.5) * 2,
        -(e.clientY / innerHeight - 0.5) * 2,
      );
    addEventListener("pointermove", move, { passive: true });
    gsap.registerPlugin(ScrollTrigger);
    const anim = gsap.to(progress.current, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#awakening",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
    const final = gsap.to(reunion.current, {
      value: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#contact",
        start: "top bottom",
        end: "top 5%",
        scrub: 1,
      },
    });
    return () => {
      removeEventListener("pointermove", move);
      final.scrollTrigger?.kill();
      final.kill();
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [reduced]);
  useFrame(({ clock }) => {
    const pointer = aim.current;
    if (!group.current || !ribs.current) return;
    const t = clock.getElapsedTime();
    const unfold = finalActive ? reunion.current.value : progress.current.value;
    group.current.rotation.y =
      -0.42 +
      (reduced ? 0 : Math.sin(t * 0.17) * 0.11 + pointer.x * 0.09) +
      unfold * 0.8;
    group.current.rotation.z = 0.1 + (reduced ? 0 : Math.sin(t * 0.2) * 0.025);
    ribs.current.children.forEach((c, i) => {
      const angle = (i / 9) * Math.PI * 2;
      c.position.x = Math.cos(angle) * unfold * 0.6;
      c.position.y = Math.sin(angle) * unfold * 0.6;
    });
  });
  return (
    <group ref={group} rotation={[0.3, -0.4, 0.1]} scale={1.13}>
      <Float
        speed={reduced ? 0 : 1.15}
        rotationIntensity={0.07}
        floatIntensity={0.22}
      >
        <group ref={ribs}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI) / 9, 0]}>
              <torusGeometry args={[1.23, 0.095, 12, 100, Math.PI * 1.67]} />
              <meshPhysicalMaterial
                color={
                  i % 3 === 0 ? "#64263e" : i % 3 === 1 ? "#d7b4a1" : "#fff2e3"
                }
                metalness={i % 3 === 0 ? 0.78 : 0.18}
                roughness={i % 3 === 0 ? 0.19 : 0.28}
                clearcoat={1}
              />
            </mesh>
          ))}
        </group>
        <mesh rotation={[0.7, 0.35, 0.3]}>
          <torusGeometry args={[0.7, 0.18, 24, 100]} />
          <meshPhysicalMaterial
            color="#b86d83"
            roughness={0.12}
            metalness={0.5}
            clearcoat={1}
          />
        </mesh>
        <mesh rotation={[-0.4, 0.2, -0.6]}>
          <torusGeometry args={[1.52, 0.055, 12, 100, Math.PI * 1.65]} />
          <meshStandardMaterial
            color="#a57b65"
            metalness={0.82}
            roughness={0.27}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <icosahedronGeometry args={[0.37, 1]} />
          <meshPhysicalMaterial
            color="#f1b7c5"
            roughness={0.06}
            metalness={0.2}
            transmission={0.65}
            thickness={1.3}
            ior={1.45}
          />
        </mesh>
        {[-1, 1].map((s, i) => (
          <mesh
            key={s}
            position={[s * 1.15, s * 0.58, 0.1]}
            rotation={[0, 0, 0.4]}
          >
            <sphereGeometry args={[i ? 0.12 : 0.08, 24, 24]} />
            <meshStandardMaterial
              color="#6c2d43"
              metalness={0.8}
              roughness={0.16}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}
export default function Core() {
  const [capable, setCapable] = useState(false),
    [reduced, setReduced] = useState(false),
    [visible, setVisible] = useState(true),
    [finalActive, setFinalActive] = useState(false);
  const host = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    setCapable(!!gl);
    if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
    setReduced(matchMedia("(prefers-reduced-motion:reduce)").matches);
  }, []);
  useEffect(() => {
    if (!capable) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const a = host.current?.getBoundingClientRect(),
        b = document.querySelector(".final-core-slot")?.getBoundingClientRect();
      const final = !!b && b.top < innerHeight && b.bottom > 0;
      const rect = final ? b : a;
      const inView =
        !!rect && rect.bottom > 0 && rect.top < innerHeight && !document.hidden;
      setVisible(inView);
      setFinalActive(final);
      if (rect && viewport.current)
        Object.assign(viewport.current.style, {
          left: rect.left + "px",
          top: rect.top + "px",
          width: rect.width + "px",
          height: rect.height + "px",
          visibility: inView ? "visible" : "hidden",
        });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [capable]);
  return (
    <>
      <div
        ref={host}
        className="core-stage"
        role="img"
        aria-label="Intelligence Core: an architectural sculpture of interwoven porcelain, champagne and burgundy ribs"
      >
        {!capable && <Fallback />}
      </div>
      {capable &&
        createPortal(
          <div ref={viewport} className="core-viewport" aria-hidden="true">
            <Boundary>
              {" "}
              <Canvas
                dpr={[1, matchMedia("(max-width:760px)").matches ? 1.2 : 1.6]}
                camera={{ position: [0, 0.2, 6.8], fov: 37 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "low-power",
                }}
                frameloop={!visible ? "never" : reduced ? "demand" : "always"}
              >
                <ambientLight intensity={0.7} />
                <directionalLight
                  position={[4, 5, 4]}
                  intensity={3}
                  color="#ffead5"
                />
                <directionalLight
                  position={[-3, 0, 2]}
                  intensity={2}
                  color="#df9eae"
                />
                <Sculpture reduced={reduced} finalActive={finalActive} />
                <ContactShadows
                  position={[0, -2.15, 0]}
                  opacity={0.22}
                  scale={9}
                  blur={3}
                  far={4}
                  resolution={256}
                />
                <Environment resolution={128}>
                  <Lightformer
                    form="rect"
                    intensity={4}
                    position={[0, 5, -2]}
                    scale={[6, 3, 1]}
                  />
                  <Lightformer
                    form="rect"
                    intensity={3}
                    position={[-5, 1, 3]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={[4, 6, 1]}
                  />
                </Environment>
              </Canvas>
            </Boundary>
          </div>,
          document.body,
        )}
    </>
  );
}
