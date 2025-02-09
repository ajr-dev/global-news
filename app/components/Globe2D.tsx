"use client"

import { useState } from "react"
import NewsPopup from "./NewsPopup"
import useNews from "../hooks/useNews"

export default function Globe2D() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const { news, isLoading, error } = useNews(selectedCountry)

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full max-w-4xl"
        style={{ filter: "drop-shadow(0px 0px 10px rgba(255,255,255,0.5))" }}
      >
        {/* Simplified world map paths */}
        <path
          d="M250,100 L750,100 L750,400 L250,400 Z"
          fill="#4a90e2"
          stroke="#ffffff"
          strokeWidth="2"
          onClick={() => handleCountryClick("USA")}
          className="cursor-pointer hover:fill-blue-400 transition-colors"
        />
        {/* Add more country paths here */}
      </svg>
      {selectedCountry && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <NewsPopup
            country={selectedCountry}
            news={news}
            isLoading={isLoading}
            error={error}
            onClose={() => setSelectedCountry(null)}
          />
        </div>
      )}
    </div>
  )
}