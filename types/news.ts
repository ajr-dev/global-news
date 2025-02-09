export interface NewsConfig {
  url: string;
  parser: (xml: string) => News[];
}

export interface News {
  title: string;
  description: string;
  url: string;
  image?: string;
  age?: string;
}

// Helper function to convert a date string to a relative time string.
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return diffMinutes + " minutes ago";
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    return diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
  }
}

// Function to transform image URLs based on the source domain
function transformImageUrl(
  url: string | undefined,
): string | undefined {
  if (!url) return undefined;

  try {
    // BBC-specific transformations
    if (url.includes("bbci.co.uk")) {
      // For Mexico's BBC feed
      if (url.includes("topics/crr7mlg0vr2t")) {
        return url.replace("ace/standard/240", "news/640") + ".webp";
      }
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
  ];

  for (const sourceFunc of imageSources) {
    const imageUrl = sourceFunc();
    if (imageUrl) {
      return transformImageUrl(imageUrl);
    }
  }

  return undefined;
}

function parseNewsItems(
  xml: string,
  feedUrl: string,
  options: {
    titleTransform?: (title: string) => string;
  } = {}
): News[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const items = xmlDoc.getElementsByTagName("item");

  const newsItems = Array.from(items).map((item) => {
    let title = item.getElementsByTagName("title")[0]?.textContent || "";
    if (options.titleTransform) {
      title = options.titleTransform(title);
    }

    const rawDescription =
      item.getElementsByTagName("description")[0]?.textContent || "";
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
    const age = pubDate ? getRelativeTime(pubDate) : undefined;
    const timestamp = pubDate ? new Date(pubDate).getTime() : 0;

    return { title, description, url, image, age, timestamp };
  });

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

  // Remove the temporary timestamp field.
  return uniqueNewsItems.map(({ timestamp, ...rest }) => rest);
}

export const COUNTRY_NEWS_CONFIGS: Record<string, NewsConfig> = {
  "South Africa": {
    url: "https://feeds.24.com/articles/news24/southafrica/rss",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url, {
        titleTransform: (title) => title.replace("News24 | ", ""),
      });
    },
  },
  UK: {
    url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Australia: {
    url: "https://www.brisbanetimes.com.au/rss/feed.xml",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  USA: {
    url: "https://moxie.foxnews.com/google-publisher/us.xml",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Mexico: {
    url: "https://feeds.bbci.co.uk/news/topics/crr7mlg0vr2t/rss.xml",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Brazil: {
    url: "https://g1.globo.com/rss/g1/",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Argentina: {
    url: "https://www.batimes.com.ar/feed",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Canada: {
    url: "https://www.cbc.ca/webfeed/rss/rss-canada",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
  Netherlands: {
    url: "https://www.omroepbrabant.nl/rss",
    parser: function (xml: string) {
      return parseNewsItems(xml, this.url);
    },
  },
};
