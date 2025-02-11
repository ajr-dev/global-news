"use client";
import { useState, useEffect } from "react";
import { News, NewsConfig, getCountryNewsConfigs } from "@/types/news";

export default function useNews(country: string | null) {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, NewsConfig> | null>(null);

  // First effect to load configs once when hook is mounted
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const loadedConfigs = await getCountryNewsConfigs();
        setConfigs(loadedConfigs);
      } catch (err) {
        setError("Failed to load country configurations");
        console.error(err);
      }
    };
    loadConfigs();
  }, []);

  // Second effect to fetch news when country changes or configs are loaded
  useEffect(() => {
    if (!country || !configs) return;

    setIsLoading(true);
    setError(null);

    const fetchNews = async () => {
      try {
        const config = configs[country];
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
  }, [country, configs]);

  return { news, isLoading, error };
}