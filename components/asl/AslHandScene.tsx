"use client"

/**
 * 3D ASL hand viewport (React Three Fiber).
 * Drop public/models/asl-hand.glb (or set NEXT_PUBLIC_ASL_HAND_MODEL_URL) with clips named
 * hello_ASL, help_ASL for rigged animations; otherwise a procedural hand plays a motion fallback.
 */
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, useAnimations, useGLTF } from "@react-three/drei"
import { forwardRef, Suspense, useImperativeHandle, useMemo, useRef, type RefObject } from "react"
import * as THREE from "three"

export type AslHandViewportHandle = {
  triggerAslAnimation: (intent: string) => void
}

/** Map app intents to glTF animation clip names on your rig. */
export const INTENT_TO_CLIP: Record<string, string> = {
  GREETING: "hello_ASL",
  OFFER_HELP: "help_ASL",
  greeting: "hello_ASL",
  offer_help: "help_ASL",
}

function resolveClipName(intent: string): string | undefined {
  const k = intent.trim()
  return INTENT_TO_CLIP[k] ?? INTENT_TO_CLIP[k.toUpperCase()]
}

const GltfRig = forwardRef<AslHandViewportHandle, { url: string }>(function GltfRig({ url }, ref) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(url)
  const clone = useMemo(() => scene.clone(true), [scene])
  const { actions, mixer } = useAnimations(animations, group)

  useImperativeHandle(
    ref,
    () => ({
      triggerAslAnimation(intent: string) {
        const clip = resolveClipName(intent)
        if (!clip || !actions[clip]) return
        for (const a of Object.values(actions)) {
          a?.stop()
        }
        actions[clip]?.reset().play()
      },
    }),
    [actions]
  )

  useFrame((_, delta) => {
    mixer.update(delta)
  })

  return (
    <group ref={group}>
      <primitive object={clone} scale={1.2} position={[0, -0.35, 0]} />
    </group>
  )
})

const FallbackHand = forwardRef<AslHandViewportHandle>(function FallbackHand(_, ref) {
  const root = useRef<THREE.Group>(null)
  const animRef = useRef<{ kind: string; t: number } | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      triggerAslAnimation(intent: string) {
        animRef.current = { kind: intent.toUpperCase(), t: 0 }
      },
    }),
    []
  )

  useFrame((_, delta) => {
    const g = root.current
    if (!g) return
    const a = animRef.current
    if (a) {
      a.t += delta
      g.rotation.y = Math.sin(a.t * 5) * 0.45
      g.rotation.z = Math.cos(a.t * 3.5) * 0.18
      if (a.t > 2.8) animRef.current = null
    } else {
      g.rotation.y *= 0.92
      g.rotation.z *= 0.92
    }
  })

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#deb887", roughness: 0.45 }), [])

  return (
    <group ref={root} position={[0, -0.15, 0]}>
      <mesh castShadow material={mat} position={[0, 0, 0]}>
        <boxGeometry args={[0.38, 0.48, 0.14]} />
      </mesh>
      {[-0.14, -0.05, 0.05, 0.14].map((x, i) => (
        <mesh key={i} castShadow material={mat} position={[x, 0.32, 0]}>
          <boxGeometry args={[0.07, 0.22, 0.07]} />
        </mesh>
      ))}
      <mesh castShadow material={mat} position={[0.18, -0.12, 0]}>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
      </mesh>
    </group>
  )
})

function HandContent({ modelUrl, handRef }: { modelUrl?: string; handRef: RefObject<AslHandViewportHandle | null> }) {
  if (modelUrl?.trim()) {
    return (
      <Suspense fallback={<FallbackHand ref={handRef} />}>
        <GltfRig ref={handRef} url={modelUrl.trim()} />
      </Suspense>
    )
  }
  return <FallbackHand ref={handRef} />
}

export type AslHandSceneProps = {
  /** Absolute URL or site-relative path to .glb (optional). */
  modelUrl?: string
}

export const AslHandScene = forwardRef<AslHandViewportHandle, AslHandSceneProps>(function AslHandScene(
  { modelUrl: modelUrlProp },
  ref
) {
  const innerRef = useRef<AslHandViewportHandle>(null)
  const modelUrl =
    modelUrlProp?.trim() ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ASL_HAND_MODEL_URL?.trim()) ||
    undefined

  useImperativeHandle(
    ref,
    () => ({
      triggerAslAnimation: (intent: string) => {
        innerRef.current?.triggerAslAnimation(intent)
      },
    }),
    []
  )

  return (
    <Canvas
      className="h-full min-h-[280px] w-full touch-none"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#141418"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 6, 4]} intensity={1.15} castShadow />
      <PerspectiveCamera makeDefault position={[0, 0.15, 2.35]} fov={40} />
      <HandContent modelUrl={modelUrl} handRef={innerRef} />
      <OrbitControls enablePan={false} minDistance={1.4} maxDistance={4} minPolarAngle={0.55} maxPolarAngle={Math.PI / 1.65} />
    </Canvas>
  )
})
