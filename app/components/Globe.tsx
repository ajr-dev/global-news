"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useSpring, animated } from '@react-spring/three'

import useNews from "../hooks/useNews"

const AnimatedText = animated(Text)

interface GlobeProps {
  onSelectCountry: (country: string | null) => void
  isCountrySelected: boolean
  resetGlobePosition: () => void
}

export default function Globe({ onSelectCountry, isCountrySelected, resetGlobePosition }: GlobeProps) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)
  const [bumpTexture, setBumpTexture] = useState<THREE.Texture | null>(null)
  const [specularTexture, setSpecularTexture] = useState<THREE.Texture | null>(null)
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [selectedButton, setSelectedButton] = useState<string | null>(null)
  const lastPosition = useRef({ x: 0, y: 0 })
  const { camera, gl } = useThree()
  const originalCameraPosition = useRef(new THREE.Vector3())
  const targetCameraPosition = useRef(new THREE.Vector3())

  const { news, isLoading, error } = useNews(selectedButton)

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    loader.load("/assets/earth-large.jpg", (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.flipY = true
      loadedTexture.offset.x = 0
      loadedTexture.offset.y = 0
      loadedTexture.repeat.set(1, 1)
      setEarthTexture(loadedTexture)
    })

    loader.load("/assets/bump-large.jpg", (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.flipY = true
      loadedTexture.offset.x = 0
      loadedTexture.offset.y = 0
      loadedTexture.repeat.set(1, 1)
      setBumpTexture(loadedTexture)
    })

    loader.load("/assets/specular.jpg", (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.flipY = true
      loadedTexture.offset.x = 0
      loadedTexture.offset.y = 0
      loadedTexture.repeat.set(1, 1)
      setSpecularTexture(loadedTexture)
    })

    loader.load("/assets/clouds-large.jpg", (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.flipY = true
      loadedTexture.offset.x = 0
      loadedTexture.offset.y = 0
      loadedTexture.repeat.set(1, 1)
      setCloudsTexture(loadedTexture)
    })

    originalCameraPosition.current.copy(camera.position)
  }, [camera])

  const handlePointerDown = (e: THREE.Event) => {
    setIsDragging(true)
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: THREE.Event) => {
    if (!isDragging || !earthRef.current || !cloudsRef.current) return
    const deltaX = e.clientX - lastPosition.current.x
    const deltaY = e.clientY - lastPosition.current.y

    earthRef.current.rotation.y += deltaX * 0.005
    earthRef.current.rotation.x += deltaY * 0.005
    cloudsRef.current.rotation.y += deltaX * 0.005
    cloudsRef.current.rotation.x += deltaY * 0.005

    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  useFrame((state, delta) => {
    if (earthRef.current && !isDragging && !hoveredButton && !isCountrySelected) {
      earthRef.current.rotation.y += delta * 0.05
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07
    }

    if (lightRef.current) {
      const cameraPosition = new THREE.Vector3()
      camera.getWorldPosition(cameraPosition)
      lightRef.current.position.copy(cameraPosition)
      lightRef.current.position.x -= 4
      lightRef.current.position.y += 2
      lightRef.current.position.multiplyScalar(1.5)
    }

    // Smooth camera movement
    if (isCountrySelected) {
      camera.position.lerp(targetCameraPosition.current, 0.05)
    } else {
      camera.position.lerp(originalCameraPosition.current, 0.05)
    }
  })

  const EarthMaterial = useMemo(() => {
    if (earthTexture && bumpTexture) {
      return new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.1,
        displacementMap: bumpTexture,
        displacementScale: 0.1,
        specular: 0xffffff,
        shininess: 50,
        shadowSide: THREE.FrontSide,
      })
    }
    return null
  }, [earthTexture, bumpTexture])

  const buttons = [
    { id: "button1", lat: 36.2048, lon: 138.2529, text: "Japan" },
    { id: "button2", lat: 46.2276, lon: 2.2137, text: "France" },
    { id: "button3", lat: 52.1326, lon: 5.2913, text: "Netherlands" },
    { id: "button5", lat: 61.5240, lon: 105.3188, text: "Russia" },
    { id: "button6", lat: -25.2744, lon: 133.7751, text: "Australia" },
    { id: "button7", lat: 55.3781, lon: -3.4360, text: "UK" },
    { id: "button8", lat: 35.8617, lon: 104.1954, text: "China" },
    { id: "button9", lat: 20.5937, lon: 78.9629, text: "India" },
    { id: "button10", lat: -14.2350, lon: -51.9253, text: "Brazil" },
    { id: "button11", lat: -38.4161, lon: -63.6167, text: "Argentina" },
    { id: "button12", lat: 23.6345, lon: -102.5528, text: "Mexico" },
    { id: "button14", lat: 37.0902, lon: -95.7129, text: "USA" },
    { id: "button15", lat: 41.8719, lon: 12.5674, text: "Italy" },
    { id: "button16", lat: 40.4637, lon: -3.7492, text: "Spain" },
    { id: "button17", lat: 50.5039, lon: 4.4699, text: "Belgium" },
    { id: "button18", lat: 61.9241, lon: 25.7482, text: "Finland" },
    { id: "button19", lat: 60.1282, lon: 18.6435, text: "Sweden" },
    { id: "button20", lat: 60.4720, lon: 8.4689, text: "Norway" },
    { id: "button21", lat: 56.2639, lon: 9.5018, text: "Denmark" },
    { id: "button22", lat: 46.8182, lon: 8.2275, text: "Switzerland" },
    { id: "button23", lat: 39.3999, lon: -8.2245, text: "Portugal" },
    { id: "button24", lat: 51.1657, lon: 10.4515, text: "Germany" },
    { id: "button25", lat: 47.5162, lon: 14.5501, text: "Austria" },
    { id: "button26", lat: 47.1625, lon: 19.5033, text: "Hungary" },
    { id: "button27", lat: 49.8175, lon: 15.4730, text: "Czech Republic" },
    { id: "button28", lat: 45.1000, lon: 15.2000, text: "Croatia" },
    { id: "button29", lat: 42.7339, lon: 25.4858, text: "Bulgaria" },
    { id: "button30", lat: 39.0742, lon: 21.8243, text: "Greece" },
    { id: "button31", lat: 41.1533, lon: 20.1683, text: "Albania" },
    { id: "button33", lat: 56.1304, lon: -106.3468, text: "Canada" },
    { id: "button36", lat: 1.3521, lon: 103.8198, text: "Singapore" },
    { id: "button37", lat: 15.8700, lon: 100.9925, text: "Thailand" },
    { id: "button38", lat: -0.7893, lon: 113.9213, text: "Indonesia" },
    { id: "button39", lat: 4.2105, lon: 101.9758, text: "Malaysia" },
    { id: "button40", lat: 12.8797, lon: 121.7740, text: "Philippines" },
    { id: "button41", lat: -30.5595, lon: 22.9375, text: "South Africa" },
    { id: "button43", lat: -0.0236, lon: 37.9062, text: "Kenya" },
    { id: "button44", lat: 9.0820, lon: 8.6753, text: "Nigeria" },
    { id: "button45", lat: 26.8206, lon: 30.8025, text: "Egypt" },
    { id: "button47", lat: 30.3753, lon: 69.3451, text: "Pakistan" },
    { id: "button48", lat: 23.6850, lon: 90.3563, text: "Bangladesh" },
    { id: "button49", lat: 28.3949, lon: 84.1240, text: "Nepal" },
    { id: "button50", lat: 38.9637, lon: 35.2433, text: "Turkey" },
  ]

  const toCartesian = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    return [x, y, z]
  }

  const handleButtonHover = (id: string) => {
    setHoveredButton(id)
  }

  const handleButtonClick = (id: string) => {
    const button = buttons.find((b) => b.id === id)
    if (button) {
      setSelectedButton(id)
      onSelectCountry(button.text)
      const [x, y, z] = toCartesian(button.lat, button.lon, 2)
      // targetCameraPosition.current.set(x * 1.5, y * 1.5, z * 1.5)
    }
  }

  useEffect(() => {
    if (!isCountrySelected) {
      setSelectedButton(null)
      onSelectCountry(null)
      targetCameraPosition.current.copy(originalCameraPosition.current)
    }
  }, [isCountrySelected, onSelectCountry])

  const { position: earthPosition } = useSpring({
    position: isCountrySelected ? [-1, 0, -1] : [0, 0, -1],
    config: { mass: 1, tension: 170, friction: 26 },
  })

  const { position: cloudsPosition } = useSpring({
    position: isCountrySelected ? [-0.85, 0, 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  })

  const { textPosition, fontSize } = useSpring({
    textPosition: isCountrySelected ? [-0.5, 0, 2] : [0, 0, 2],
    fontSize: isCountrySelected ? 0.45 : 0.55,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  return (
    <>
      <OrbitControls
        enabled={!isCountrySelected}
        enablePan={false}
        enableZoom={false}
        enableRotate={!isCountrySelected}
        rotateSpeed={0.4}
      />

      <directionalLight ref={lightRef} intensity={0.12} color={0xfff0e0} castShadow />
      <ambientLight intensity={1} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.2} />
      </EffectComposer>

      {/* Earth sphere */}
      <animated.mesh
        ref={earthRef}
        position={earthPosition.to((x, y, z) => [x, y, z])}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        renderOrder={1}
      >
        <sphereGeometry args={[2, 64, 64]} />
        {EarthMaterial ? (
          <primitive attach="material" object={EarthMaterial} />
        ) : (
          <meshStandardMaterial color="#4477AA" metalness={0.1} roughness={0.7} />
        )}
        {/* Buttons */}
        {buttons.map((button) => {
          const [x, y, z] = toCartesian(button.lat, button.lon, 2)
          return (
            <mesh
              key={button.id}
              position={[x, y, z]}
              onPointerOver={() => handleButtonHover(button.id)}
              onPointerOut={() => setHoveredButton(null)}
              onClick={() => handleButtonClick(button.id)}
            >
              <sphereGeometry args={[0.03, 32, 32]} />
              <meshStandardMaterial color="purple" opacity={0.9} transparent={true} />
            </mesh>
          )
        })}
      </animated.mesh>
      {/* Cloud layer */}
      {cloudsTexture && (
        <animated.mesh ref={cloudsRef} position={cloudsPosition.to((x, y, z) => [x, y, z])} renderOrder={2}>
          <sphereGeometry args={[1.7, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent={true}
            opacity={1}
            alphaMap={cloudsTexture}
            blendSrcAlpha={0.1}
            blendDstAlpha={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </animated.mesh>
      )}

      {/* Hover text */}
      {hoveredButton && (
        <animated.group position={textPosition.to((x, y, z) => [x, y, z])}>
          <AnimatedText
            fontSize={fontSize}
            font="/assets/AveriaSerifLibre-Bold.ttf"
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {buttons.find((b) => b.id === hoveredButton)?.text.toUpperCase() || ""}
          </AnimatedText>
        </animated.group>
      )}
    </>
  )
}