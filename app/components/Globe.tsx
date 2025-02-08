"use client"
import { useRef, useState, useEffect } from "react"
import { useThree, useFrame, extend } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import NewsPanel from "./NewsPanel"

// Extend the THREE namespace to include the Text component
extend({ Text })

export default function Globe() {
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
  const { camera } = useThree()

  const targetRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })
  const dragSpeed = 0.005
  const smoothingFactor = 0.1 // Adjust this value to control smoothing (0.1 = smooth, 1 = instant)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    
    // Load Earth texture
    loader.load('/assets/earth-large.jpg', (loadedTexture) => {
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

    // Load Bump texture
    loader.load('/assets/bump-large.jpg', (loadedTexture) => {
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

    // Load Specular texture
    loader.load('/assets/specular.jpg', (loadedTexture) => {
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

    // Load Clouds texture
    loader.load('/assets/clouds-large.jpg', (loadedTexture) => {
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
  }, [])

  const handlePointerDown = (e: THREE.Event) => {
    setIsDragging(true)
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: THREE.Event) => {
    if (!isDragging || !earthRef.current || !cloudsRef.current) return
    const deltaX = e.clientX - lastPosition.current.x
    const deltaY = e.clientY - lastPosition.current.y
    
    // Rotate both Earth and clouds
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
    if (earthRef.current && !isDragging && !hoveredButton && !selectedButton) {
      // Rotate Earth
      earthRef.current.rotation.y += delta * 0.05
    }

    if (cloudsRef.current) {
      // Rotate clouds slightly faster for a dynamic effect
      cloudsRef.current.rotation.y += delta * 0.07
    }

    if (lightRef.current) {
      const cameraPosition = new THREE.Vector3()
      camera.getWorldPosition(cameraPosition)
      lightRef.current.position.copy(cameraPosition)
      lightRef.current.position.x -= 4 // Move light to the left
      lightRef.current.position.y += 2 // Move light up
      lightRef.current.position.multiplyScalar(1.5)
    }
  })

  let EarthMaterial: THREE.MeshPhongMaterial | null = null;
  if (earthTexture && bumpTexture) {
    EarthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.1,
      displacementMap: bumpTexture,
      displacementScale: 0.1,
      specular: 0xffffff,
      shininess: 50,
      shadowSide: THREE.FrontSide,
    });
  }

  const buttons = [
    { id: 'button1', lat: 35.6895, lon: 139.6917, text: 'Japan' },
    { id: 'button2', lat: 48.8566, lon: 2.3522, text: 'France' },
    { id: 'button3', lat: 52.3676, lon: 4.9041, text: 'Netherlands' },
    { id: 'button5', lat: 55.7558, lon: 37.6173, text: 'Russia' },
    { id: 'button6', lat: -33.8688, lon: 151.2093, text: 'Australia' },
    { id: 'button7', lat: 51.5074, lon: -0.1278, text: 'UK' },
    { id: 'button8', lat: 39.9042, lon: 116.4074, text: 'China' },
    { id: 'button9', lat: 28.6139, lon: 77.2090, text: 'India' },
    { id: 'button10', lat: -23.5505, lon: -46.6333, text: 'Brazil' },
    { id: 'button11', lat: -34.6037, lon: -58.3816, text: 'Argentina' },
    { id: 'button12', lat: 19.4326, lon: -99.1332, text: 'Mexico' },
    { id: 'button14', lat: 34.0522, lon: -118.2437, text: 'USA' },
    { id: 'button15', lat: 41.9028, lon: 12.4964, text: 'Italy' },
    { id: 'button16', lat: 40.4168, lon: -3.7038, text: 'Spain' },
    { id: 'button17', lat: 50.8503, lon: 4.3517, text: 'Belgium' },
    { id: 'button18', lat: 60.1695, lon: 24.9354, text: 'Finland' },
    { id: 'button19', lat: 59.3293, lon: 18.0686, text: 'Sweden' },
    { id: 'button20', lat: 59.9139, lon: 10.7522, text: 'Norway' },
    { id: 'button21', lat: 55.6761, lon: 12.5683, text: 'Denmark' },
    { id: 'button22', lat: 46.2044, lon: 6.1432, text: 'Switzerland' },
    { id: 'button23', lat: 38.7223, lon: -9.1393, text: 'Portugal' },
    { id: 'button24', lat: 52.5200, lon: 13.4050, text: 'Germany' },
    { id: 'button25', lat: 48.2082, lon: 16.3738, text: 'Austria' },
    { id: 'button26', lat: 47.4979, lon: 19.0402, text: 'Hungary' },
    { id: 'button27', lat: 50.0755, lon: 14.4378, text: 'Czech Republic' },
    { id: 'button28', lat: 45.8150, lon: 15.9819, text: 'Croatia' },
    { id: 'button29', lat: 42.6977, lon: 23.3219, text: 'Bulgaria' },
    { id: 'button30', lat: 37.9838, lon: 23.7275, text: 'Greece' },
    { id: 'button31', lat: 41.3275, lon: 19.8187, text: 'Albania' },
    { id: 'button33', lat: 45.4215, lon: -75.6972, text: 'Canada' },
    { id: 'button35', lat: 35.6762, lon: 139.6503, text: 'Japan' },
    { id: 'button36', lat: 1.3521, lon: 103.8198, text: 'Singapore' },
    { id: 'button37', lat: 13.7563, lon: 100.5018, text: 'Thailand' },
    { id: 'button38', lat: -6.2088, lon: 106.8456, text: 'Indonesia' },
    { id: 'button39', lat: 3.1390, lon: 101.6869, text: 'Malaysia' },
    { id: 'button40', lat: 14.5995, lon: 120.9842, text: 'Philippines' },
    { id: 'button41', lat: -33.9249, lon: 18.4241, text: 'South Africa' },
    { id: 'button43', lat: -1.2921, lon: 36.8219, text: 'Kenya' },
    { id: 'button44', lat: 6.5244, lon: 3.3792, text: 'Nigeria' },
    { id: 'button45', lat: 30.0444, lon: 31.2357, text: 'Egypt' },
    { id: 'button47', lat: 24.8607, lon: 67.0011, text: 'Pakistan' },
    { id: 'button48', lat: 23.8103, lon: 90.4125, text: 'Bangladesh' },
    { id: 'button49', lat: 27.7172, lon: 85.3240, text: 'Nepal' },
    { id: 'button50', lat: 39.9334, lon: 32.8597, text: 'Turkey' },
    // Add more countries as needed
  ]

  const toCartesian = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))
    return [x, y, z]
  }

  const handleButtonHover = (id: string) => {
    setHoveredButton(id)
  }

  const handleButtonClick = (id: string) => {
    setSelectedButton(id)
    // Zoom in on the button
    const button = buttons.find(b => b.id === id)
    if (button) {
      const [x, y, z] = toCartesian(button.lat, button.lon, 2)
      camera.position.set(x * 2, y * 2, z * 2)
    }
  }

  const handleClosePanel = () => {
    setSelectedButton(null)
    // Reset camera position
    camera.position.set(0, 0, 5)
  }

  return (
    <>
      <OrbitControls enabled={false} />
      
      <directionalLight
        ref={lightRef}
        intensity={0.12}
        color={0xfff0e0}
        castShadow
      />
      <ambientLight intensity={1} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.2} />
      </EffectComposer>

      {/* Earth sphere */}
      <mesh
        ref={earthRef}
        position={[0, 0, -1]}
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
          <meshStandardMaterial
            color="#4477AA"
            metalness={0.1}
            roughness={0.7}
          />
        )}
        {/* Buttons */}
        {buttons.map(button => {
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
      </mesh>
      {/* Cloud layer */}
      {cloudsTexture && (
        <mesh
          ref={cloudsRef}
          position={[0, 0, 0]}
          renderOrder={2}
        >
          <sphereGeometry args={[1.70, 64, 64]} />
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
        </mesh>
      )}

      {/* Hover text */}
      {hoveredButton && (
        <Text
          font="/assets/AveriaSerifLibre-Bold.ttf"
          position={[0, 0, 2]}
          fontSize={0.55}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {buttons.find(b => b.id === hoveredButton)?.text.toUpperCase() || ''}
        </Text>
      )}

      {/* News panel */}
      {/* TODO: This does not work and crashes the application */}
      {selectedButton && <NewsPanel onClose={handleClosePanel} />}
    </>
  )
}