import { crawlAllSources } from './crawlers';
import { summarizeArticle } from './summarizer';
import { createServiceClient } from './supabase';
import type { CollectResult } from '@/types';

export async function runCollection(summarizeLimit = 10): Promise<CollectResult> {
  const db = createServiceClient();
  const errors: string[] = [];

  // 1. Crawl all RSS sources
  const { articles: rawArticles, errors: crawlErrors } = await crawlAllSources();
  errors.push(...crawlErrors);

  let newCount = 0;

  if (rawArticles.length > 0) {
    // 2. Deduplicate against existing URLs
    const urls = rawArticles.map((a) => a.url);
    const { data: existing } = await db.from('articles').select('url').in('url', urls);
    const existingUrls = new Set((existing || []).map((e: { url: string }) => e.url));
    const newArticles = rawArticles.filter((a) => !existingUrls.has(a.url));
    newCount = newArticles.length;

    // 3. Batch insert new articles
    if (newArticles.length > 0) {
      const rows = newArticles.map((a) => ({
        title: a.title,
        url: a.url,
        source: a.source,
        source_url: a.source_url,
        original_content: a.content || null,
        published_at: a.published_at?.toISOString() || null,
        is_summarized: false,
      }));

      const { error } = await db.from('articles').insert(rows);
      if (error) errors.push(`Insert error: ${error.message}`);
    }
  }

  // 4. Summarize unsummarized articles (batch)
  const { data: toSummarize } = await db
    .from('articles')
    .select('id, title, original_content')
    .eq('is_summarized', false)
    .limit(summarizeLimit);

  let summarized = 0;
  for (const article of toSummarize || []) {
    try {
      const summary = await summarizeArticle(article.title, article.original_content || '');
      await db.from('articles').update({ summary, is_summarized: true }).eq('id', article.id);
      summarized++;
    } catch (err) {
      const msg = `Summarize ${article.id}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error('[Summarizer]', msg);
    }
  }

  return {
    success: true,
    crawled: rawArticles.length,
    newArticles: newCount,
    summarized,
    errors,
  };
}
