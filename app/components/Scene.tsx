"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { Stars } from "@react-three/drei"
import Globe from "./Globe"
import NewsPanel from "./NewsPanel"
import useNews from "../hooks/useNews"

export default function Scene() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const { news, isLoading, error } = useNews(selectedCountry)

  const resetGlobePosition = () => {
    setSelectedCountry(null)
  }

  return (
    <div className="bg-[#1D585E] absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.15} />
          <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
          <Globe
            onSelectCountry={setSelectedCountry}
            isCountrySelected={selectedCountry !== null}
            resetGlobePosition={resetGlobePosition}
          />
        </Suspense>
      </Canvas>
      {selectedCountry && (
        <NewsPanel
          country={selectedCountry}
          news={news}
          isLoading={isLoading}
          error={error}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  )
}