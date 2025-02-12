import dotenv from "dotenv";
import { csvParse } from "d3-dsv";

export interface NewsConfig {
  url: string;
  parser: (xml: string) => Promise<News[]>;
}

export interface News {
  title: string;
  description: string;
  url: string;
  image?: string;
  age?: string;
}

interface CountryData {
  name: string;
  rss: string;
}

let cachedConfigs: Record<string, NewsConfig> | null = null;

async function loadCountryConfigs(): Promise<Record<string, NewsConfig>> {
  if (cachedConfigs) {
    return cachedConfigs;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/assets/countries.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    
    const csvContent = await response.text();
    
    if (!csvContent) {
      throw new Error('CSV file is empty');
    }

    const parsedData = csvParse(csvContent) as CountryData[];
    
    if (!parsedData || parsedData.length === 0) {
      throw new Error('No data parsed from CSV');
    }

    const configs: Record<string, NewsConfig> = {};
    
    for (const row of parsedData) {
      // Validate the URL before using it
      try {
        new URL(row.rss);
      } catch {
        continue; // Skip this entry if the URL is invalid
      }

      configs[row.name] = {
        url: row.rss,
        parser: async function (xml: string) {
          return await parseNewsItems(xml);
        },
      };
    }

    if (Object.keys(configs).length === 0) {
      throw new Error('No valid configurations found in CSV');
    }

    cachedConfigs = configs;
    return configs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load country configurations: ${errorMessage}`);
  }
}

export const getCountryNewsConfigs = async (): Promise<Record<string, NewsConfig>> => {
  const configs = await loadCountryConfigs();
  if (!configs) {
    throw new Error('Failed to load configurations');
  }
  return configs;
};

// Helper function to convert a date string to a relative time string.
function getRelativeTime(dateStr: string, localTimeCorrectionMinutes: { value: number }): string {
  const date = new Date(dateStr);
  const now = new Date();

  // Adjust the current time to match the timezone of the input date,
  // plus any global correction.
  const timezoneOffset = date.getTimezoneOffset() - now.getTimezoneOffset();
  now.setMinutes(now.getMinutes() + timezoneOffset + localTimeCorrectionMinutes.value);

  let diffMs = now.getTime() - date.getTime();
  let diffSeconds = Math.floor(diffMs / 1000);
  let diffMinutes = Math.floor(diffMs / 60000);

  // If diff is negative, update the global correction so that future calls use the correct time.
  if (diffMinutes < 0) {
    const correctionNeeded = Math.abs(diffMinutes);
    localTimeCorrectionMinutes.value += correctionNeeded;
    now.setMinutes(now.getMinutes() + correctionNeeded);
    diffMs = now.getTime() - date.getTime();
    diffSeconds = Math.floor(diffMs / 1000);
    diffMinutes = Math.floor(diffMs / 60000);
  }

  if (diffMinutes === 0) {
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
}

// Function to transform image URLs based on the source domain
function transformImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    // BBC-specific transformations
    if (url.includes("bbci.co.uk")) {
      // For Mexico's BBC feed
      // leave this code in for future reference
      //   if (url.includes("topics/crr7mlg0vr2t")) {
      //     return url.replace("ace/standard/240", "news/640") + ".webp";
      //   }
      // For UK's BBC feed
      return url.replace("ace/standard/240", "news/1536");
    }

    return url;
  } catch (e) {
    return url;
  }
}

// Function to extract image URL from various possible sources
function extractImageUrl(item: Element): string | undefined {
  const imageSources = [
    () => item.getElementsByTagName("enclosure")[0]?.getAttribute("url"),
    () => item.getElementsByTagName("media:content")[0]?.getAttribute("url"),
    () => item.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url"),
    () =>
      item.getElementsByTagName("image")[0]?.getElementsByTagName("url")[0]
        ?.textContent,
    () => {
      const description =
        item.getElementsByTagName("description")[0]?.textContent || "";
      const imgRegex = /<img[^>]+src=['"]([^'"]+)['"]/i;
      const match = description.match(imgRegex);
      return match?.[1];
    },
    () => {
      const content =
        item.getElementsByTagName("content:encoded")[0]?.textContent || "";
      const imgRegex = /<img[^>]+src=['"]([^'"]+)['"]/i;
      const match = content.match(imgRegex);
      return match?.[1];
    },
    () => {
      const enclosure = item.getElementsByTagName("enclosure")[0]?.textContent;
      return enclosure?.trim();
    },
    () => {
      const mediaGroup = item.getElementsByTagName("media:group")[0];
      return mediaGroup
        ?.getElementsByTagName("media:content")[0]
        ?.getAttribute("url");
    },
    () => {
      const image = item.getElementsByTagName("image")[0];
      return image
        ?.getElementsByTagName("img")[0]
        ?.getAttribute("src");
    },
  ];

  for (const sourceFunc of imageSources) {
    const imageUrl = sourceFunc();
    if (imageUrl) {
      return transformImageUrl(imageUrl);
    }
  }

  return undefined;
}

dotenv.config();

const DEFAULT_LOCALE = process.env.LOCALE || "en";

async function batchTranslate(
  texts: string[],
  target: string = DEFAULT_LOCALE
): Promise<string[]> {
  try {
    const res = await fetch("http://localhost:5000/translate", {
      method: "POST",
      body: JSON.stringify({
        q: texts,
        source: "auto",
        target: target,
        alternatives: 3,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(`Translation API failed with status: ${res.status}`);
      return texts;
    }

    const data = await res.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation failed:', error);
    return texts;
  }
}

const TITLE_PREFIXES_TO_REMOVE = [
  "News24 | ",
  "BBC News - ",
  "BBC - ",
];

function cleanTitle(title: string): string {
  let cleanedTitle = title;
  for (const prefix of TITLE_PREFIXES_TO_REMOVE) {
    cleanedTitle = cleanedTitle.replace(prefix, "");
  }
  return cleanedTitle.trim();
}

async function parseNewsItems(
  xml: string,
): Promise<News[]> {
  const localTimeCorrectionMinutes = { value: 0 };

  xml = xml.replace(/<hr>/g, "<hr/>");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const items = xmlDoc.getElementsByTagName("item");
  const itemsArray = Array.from(items);

  // Precompute the most recent article's pubDate.
  let latestPubDate: Date | null = null;
  for (const item of itemsArray) {
    const pubDateStr = item.getElementsByTagName("pubDate")[0]?.textContent;
    if (pubDateStr) {
      const pubDate = new Date(pubDateStr);
      if (!isNaN(pubDate.getTime()) && (!latestPubDate || pubDate > latestPubDate)) {
        latestPubDate = pubDate;
      }
    }
  }

  // If the most recent article has a negative diff, add one hour correction for every 60 minutes.
  if (latestPubDate) {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - latestPubDate.getTime()) / 60000);
    if (diffMinutes < 0) {
      const hoursToAdd = Math.ceil(Math.abs(diffMinutes) / 60);
      localTimeCorrectionMinutes.value += hoursToAdd * 60;
    }
  }

  const newsItems = await Promise.all(
    itemsArray.map(async (item) => {
      let title = item.getElementsByTagName("title")[0]?.textContent || "";
      title = cleanTitle(title);

      const rawDescription = item.getElementsByTagName("description")[0]?.textContent || "";
      let description = rawDescription.replace(/<[^>]*>/g, "").trim();

      const maxDescriptionLength = 200;
      if (description.length > maxDescriptionLength) {
        let truncIndex = description.lastIndexOf(" ", maxDescriptionLength);
        if (truncIndex === -1) {
          truncIndex = maxDescriptionLength;
        }
        description = description.substring(0, truncIndex) + "...";
      }

      const url = item.getElementsByTagName("link")[0]?.textContent || "";
      const image = extractImageUrl(item);
      const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent;
      const age = pubDate
        ? getRelativeTime(pubDate, localTimeCorrectionMinutes)
        : undefined;
      const timestamp =
        pubDate && !isNaN(new Date(pubDate).getTime())
          ? new Date(pubDate).getTime() + localTimeCorrectionMinutes.value * 60000
          : 0;

      return { title, description, url, image, age, timestamp };
    })
  );

  // Sort from latest to oldest.
  newsItems.sort((a, b) => b.timestamp - a.timestamp);

  // Filter duplicate articles based on title.
  const seenTitles = new Set<string>();
  const uniqueNewsItems = newsItems.filter((item) => {
    if (seenTitles.has(item.title)) {
      return false;
    } else {
      seenTitles.add(item.title);
      return true;
    }
  });

  // We translate both title and description for each news item.
  const textsToTranslate: string[] = [];
  uniqueNewsItems.forEach((item) => {
    textsToTranslate.push(item.title, item.description);
  });
  const translatedTexts = await batchTranslate(textsToTranslate);

  // Re-assign translated texts back to the news items
  for (let i = 0; i < uniqueNewsItems.length; i++) {
    uniqueNewsItems[i].title = translatedTexts[2 * i];
    uniqueNewsItems[i].description = translatedTexts[2 * i + 1];
  }

  // Remove the temporary timestamp field.
  return uniqueNewsItems.map(({ timestamp, ...rest }) => rest);
}
