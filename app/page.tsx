"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import Navbar from "./components/Navbar"

const Scene = dynamic(() => import("./components/Scene"), { ssr: false })

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-black text-white">
      <p className="text-2xl">Loading Globe...</p>
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </div>
    </main>
  )
}

