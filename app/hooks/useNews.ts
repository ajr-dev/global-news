"use client";
import { useState, useEffect } from "react";
import { News, COUNTRY_NEWS_CONFIGS } from "@/types/news";

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

        if (!config) {
          setError(`No supported news feed available for ${country}`);
          return;
        }

        const response = await fetch(
          `/api/news/${encodeURIComponent(country)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xml = await response.text();
        const parsedNews = await config.parser(xml);
        setNews(parsedNews);
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
