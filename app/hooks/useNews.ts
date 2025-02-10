"use client"
import { useState, useEffect } from "react";
import { News, COUNTRY_NEWS_CONFIGS } from "@/types/news";

const getMockNews = (): News[] => [
  { title: "Major Economic Reform Announced", description: "The government has announced a major economic reform to boost the economy.", url: "#", image: "https://cdn.24.co.za/files/Cms/General/d/12373/54424924c4c24572a6d7ffb502035a14.jpg", age: "1 hour ago" },
  { title: "New Environmental Protection Law Passed", description: "A new law has been passed to protect the environment.", url: "#" },
  { title: "Tech Giant Unveils Revolutionary Product", description: "A tech giant has unveiled a revolutionary new product.", url: "#" },
  { title: "National Sports Team Wins International Tournament", description: "The national sports team has won an international tournament.", url: "#" },
  { title: "Breakthrough in Renewable Energy Research", description: "Researchers have made a breakthrough in renewable energy.", url: "#" },
  { title: "Cultural Festival Attracts Record Number of Tourists", description: "A cultural festival has attracted a record number of tourists.", url: "#" },
  { title: "Government Launches New Education Initiative", description: "The government has launched a new education initiative.", url: "#" },
  { title: "Health Experts Report Decline in Chronic Diseases", description: "Health experts have reported a decline in chronic diseases.", url: "#" },
  { title: "Space Agency Announces Plans for Lunar Mission", description: "The space agency has announced plans for a lunar mission.", url: "#" },
  { title: "Stock Market Reaches All-Time High", description: "The stock market has reached an all-time high.", url: "#" },
]

export default function useNews(country: string | null) {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!country) return;
    
    setIsLoading(true);
    setError(null);

    const fetchNews = async () => {
      try {
        const config = COUNTRY_NEWS_CONFIGS[country];
        
        if (config) {
          const response = await fetch(`/api/news/${encodeURIComponent(country)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const xml = await response.text();
          const parsedNews = await config.parser(xml);
          setNews(parsedNews);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setNews(getMockNews());
        }
      } catch (err) {
        setError(`Failed to fetch news from ${country}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [country]);

  return { news, isLoading, error };
}