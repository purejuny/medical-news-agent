import Parser from 'rss-parser';
import type { RawArticle, NewsSource } from '@/types';

type FeedItem = {
  title?: string;
  link?: string;
  guid?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  pubDate?: string;
  isoDate?: string;
};

const parser = new Parser<Record<string, unknown>, FeedItem>({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsBot/1.0; +https://github.com/medical-news-agent)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
});

const RSS_SOURCES: { name: NewsSource; url: string; siteUrl: string }[] = [
  {
    name: 'WHO',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    siteUrl: 'https://www.who.int',
  },
  {
    name: 'CDC',
    url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    siteUrl: 'https://www.cdc.gov',
  },
  {
    name: 'NIH',
    url: 'https://newsnetwork.mayoclinic.org/feed/',
    siteUrl: 'https://newsnetwork.mayoclinic.org',
  },
  {
    name: 'PubMed',
    url: 'https://www.sciencedaily.com/rss/health_medicine.xml',
    siteUrl: 'https://www.sciencedaily.com',
  },
  {
    name: 'MedicalXpress',
    url: 'https://medicalxpress.com/rss-feed/',
    siteUrl: 'https://medicalxpress.com',
  },
  {
    name: 'GoogleNews',
    url: 'https://news.google.com/rss/search?q=disease+outbreak+health&hl=en-US&gl=US&ceid=US:en',
    siteUrl: 'https://news.google.com',
  },
  {
    name: 'Reuters',
    url: 'https://www.statnews.com/feed/',
    siteUrl: 'https://www.statnews.com',
  },
];

function sanitizeXml(xml: string): string {
  // Fix unescaped ampersands outside of known entities
  return xml.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/g, '&amp;');
}

async function crawlSourceWithFallback(
  source: { name: NewsSource; url: string; siteUrl: string }
): Promise<RawArticle[]> {
  let feed;
  try {
    feed = await parser.parseURL(source.url);
  } catch {
    // Try fetching raw and sanitizing XML first
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsBot/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Status code ${res.status}`);
    const raw = await res.text();
    const cleaned = sanitizeXml(raw);
    feed = await parser.parseString(cleaned);
  }

  return feed.items
    .slice(0, 20)
    .map((item) => ({
      title: (item.title || '').trim(),
      url: item.link || item.guid || '',
      source: source.name,
      source_url: source.siteUrl,
      content: item.contentSnippet || item.summary || item.content || '',
      published_at: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : undefined,
    }))
    .filter((a) => a.url && a.title);
}

export async function crawlAllSources(): Promise<{ articles: RawArticle[]; errors: string[] }> {
  const articles: RawArticle[] = [];
  const errors: string[] = [];

  const results = await Promise.allSettled(RSS_SOURCES.map((s) => crawlSourceWithFallback(s)));

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    } else {
      const msg = `${RSS_SOURCES[i].name}: ${result.reason?.message || 'Unknown error'}`;
      errors.push(msg);
      console.error(`[Crawler] Failed ${RSS_SOURCES[i].name}:`, result.reason);
    }
  });

  return { articles, errors };
}
