import { Github } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="absolute z-10 top-0 left-0 right-0 mx-2 my-2 rounded-3xl flex justify-between items-center p-4 bg-transparent text-white">
      <h1 className="text-2xl font-bold">GlobalNews</h1>
      <a href="#" className="hover:text-gray-300">
        <Github size={24} />
      </a>
    </nav>
  )
}

