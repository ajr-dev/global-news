export default function WebGLFallback() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-900 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">WebGL Not Supported</h2>
        <p>
          Your browser or device doesn't support WebGL, which is required to view the 3D globe.
          <br />
          Please try using a modern browser or updating your graphics drivers.
        </p>
      </div>
    </div>
  )
}

