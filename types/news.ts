// Source for a bunch of RSS feeds in every country
// https://github.com/yavuz/news-feed-list-of-countries

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
  // Parse the input date string (it includes timezone offset)
  const date = new Date(dateStr);

  // Get the current date in UTC
  const now = new Date();

  // Convert both dates to UTC and calculate the difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return diffMinutes + " minutes ago";
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    return diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
  }
}

function parseNewsItems(
  xml: string,
  options: {
    titleTransform?: (title: string) => string;
    imageSelector?: (item: Element) => string | undefined;
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
    let description = item.getElementsByTagName("description")[0]?.textContent || "";
    // Remove HTML tags from the description string.
    description = description.replace(/<[^>]*>/g, '').trim();
    // Truncate the description at the last word boundary if it gets too long.
    const maxDescriptionLength = 200;
    if (description.length > maxDescriptionLength) {
      let truncIndex = description.lastIndexOf(' ', maxDescriptionLength);
      if (truncIndex === -1) {
        truncIndex = maxDescriptionLength;
      }
      description = description.substring(0, truncIndex) + '...';
    }
    const url = item.getElementsByTagName("link")[0]?.textContent || "";
    const image = options.imageSelector
      ? options.imageSelector(item)
      : undefined;
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
    url: "https://feeds.capi24.com/v1/Search/articles/news24/TopStories/rss",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        titleTransform: (title) => title.replace("News24 | ", ""),
        imageSelector: (item) =>
          item.getElementsByTagName("enclosure")[0]?.getAttribute("url") ||
          undefined,
      }),
  },
  UK: {
    url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        imageSelector: (item) =>
          item
            .getElementsByTagName("media:thumbnail")[0]
            ?.getAttribute("url")
            ?.replace("ace/standard/240", "news/1536") || undefined,
      }),
  },
  Australia: {
    url: "https://www.brisbanetimes.com.au/rss/feed.xml",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        imageSelector: (item) =>
          item.getElementsByTagName("enclosure")[0]?.getAttribute("url") ||
          undefined,
      }),
  },
  USA: {
    url: "https://moxie.foxnews.com/google-publisher/us.xml",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        imageSelector: (item) =>
          item.getElementsByTagName("media:content")[0]?.getAttribute("url") ||
          undefined,
      }),
  },
  Mexico: {
    url: "https://feeds.bbci.co.uk/news/topics/crr7mlg0vr2t/rss.xml",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        imageSelector: (item) =>
          (
            item
              .getElementsByTagName("media:thumbnail")[0]
              ?.getAttribute("url") + ".webp"
          ).replace("ace/standard/240", "news/640") || undefined,
      }),
  },
    // I couldn't find a working RSS feed for Brazil in English
  Brazil: {
    url: "https://g1.globo.com/rss/g1/",
    parser: (xml: string) =>
      parseNewsItems(xml, {
        imageSelector: (item) =>
          item.getElementsByTagName("media:content")[0]?.getAttribute("url") ||
          undefined,
      }),
  },
};
