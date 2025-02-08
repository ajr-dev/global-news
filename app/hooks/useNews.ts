"use client"

import { useState, useEffect } from "react"

export interface News {
  title: string
  url: string
}

export default function useNews(country: string | null) {
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!country) return

    setIsLoading(true)
    setError(null)

    // This is a mock API call. In a real application, you would fetch from an actual news API.
    const fetchNews = async () => {
      try {
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock news data
        const mockNews: News[] = [
          { title: "Major Economic Reform Announced", url: "#" },
          { title: "New Environmental Protection Law Passed", url: "#" },
          { title: "Tech Giant Unveils Revolutionary Product", url: "#" },
          { title: "National Sports Team Wins International Tournament", url: "#" },
          { title: "Breakthrough in Renewable Energy Research", url: "#" },
          { title: "Cultural Festival Attracts Record Number of Tourists", url: "#" },
          { title: "Government Launches New Education Initiative", url: "#" },
          { title: "Health Experts Report Decline in Chronic Diseases", url: "#" },
          { title: "Space Agency Announces Plans for Lunar Mission", url: "#" },
          { title: "Stock Market Reaches All-Time High", url: "#" },
        ]

        setNews(mockNews)
      } catch (err) {
        setError("Failed to fetch news")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [country])

  return { news, isLoading, error }
}

