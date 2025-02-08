"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { OrbitControls, Stars } from "@react-three/drei"
import Globe from "./Globe"

export default function Scene() {
  return (
    <div className="bg-[#1D585E] absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* <color attach="background" args={["#000000"]} /> */}
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.15} />
          {/* <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} /> */}
          <Globe />
          <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0} />
        </Suspense>
      </Canvas>
    </div>
  )
}

