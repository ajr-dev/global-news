"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { useSpring, animated } from '@react-spring/three'
import { csvParse } from "d3-dsv";

import useNews from "../hooks/useNews"

const AnimatedText = animated(Text)


interface Country {
  country: string;
  latitude: number;
  longitude: number;
  name: string;
}

interface GlobeProps {
  onSelectCountry: (country: string | null) => void
  isCountrySelected: boolean
  resetGlobePosition: () => void
}

export default function Globe({ onSelectCountry, isCountrySelected, resetGlobePosition }: GlobeProps) {
  const [buttons, setButtons] = useState<{ id: string; lat: number; lon: number; text: string }[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
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

    async function fetchData() {
      const response = await fetch("/assets/countries.csv");
      const text = await response.text();
      const parsedData = csvParse(text).map((row) => ({
        code: row.country,
        lat: parseFloat(row.latitude),
        lon: parseFloat(row.longitude),
        name: row.name,
        rss: row.rss,
      }));
      setCountries(parsedData);
      const parsedButtons = parsedData
        .filter(row => row.rss)
        .map((row) => ({
          id: row.code,
          lat: row.lat,
          lon: row.lon,
          text: row.name,
      }));
      setButtons(parsedButtons);
    }
    fetchData();
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

  // Get the hovered country text (or an empty string if none)
  const hoveredCountryText = buttons.find((b) => b.id === hoveredButton)?.text || "";
  const maxLength = 11; // Maximum character count before scaling font size down
  const baseFontSize = isCountrySelected ? 0.45 : 0.55;

  // If the text length exceeds maxLength, scale the font size down
  const dynamicFontSize =
    hoveredCountryText.length > maxLength
      ? Math.max(baseFontSize * (maxLength / hoveredCountryText.length), 0.3)
      : baseFontSize;

  const { textPosition, fontSize } = useSpring({
    textPosition: isCountrySelected ? [-0.5, 0, 2] : [0, 0, 2],
    fontSize: dynamicFontSize,
    config: { mass: 1, tension: 170, friction: 26 },
  });

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
          const [x, y, z] = toCartesian(button.lat, button.lon, 2.03)
          return (
            <mesh
              key={button.id}
              position={[x, y, z]}
              onPointerOver={() => handleButtonHover(button.id)}
              onPointerOut={() => setHoveredButton(null)}
              onClick={() => handleButtonClick(button.id)}
            >
              <sphereGeometry args={[0.022, 32, 32]} />
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
            {hoveredCountryText.toUpperCase()}
          </AnimatedText>
        </animated.group>
      )}
    </>
  )
}