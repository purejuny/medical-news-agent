'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Article } from '@/types';

const SOURCE_LABELS: Record<string, string> = {
  WHO: 'WHO',
  CDC: 'CDC',
  NIH: 'NIH',
  PubMed: 'PubMed',
  MedicalXpress: 'MedicalXpress',
  GoogleNews: 'Google News',
  Reuters: 'Reuters',
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '날짜 없음';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko });
  } catch {
    return '날짜 없음';
  }
}

export default function ArticleCard({ article }: { article: Article }) {
  const dateStr = article.published_at || article.collected_at;

  return (
    <article className="flex flex-col gap-3 rounded-xl p-5 transition-all duration-200 hover:translate-y-[-2px]"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-3)' }}>

      <div className="flex items-center justify-between gap-2">
        <span className={`source-badge badge-${article.source}`}>
          {SOURCE_LABELS[article.source] || article.source}
        </span>
        <time className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {timeAgo(dateStr)}
        </time>
      </div>

      <h2 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>
        {article.title}
      </h2>

      {article.summary ? (
        <p className="text-xs leading-relaxed line-clamp-4" style={{ color: 'var(--color-text-muted)' }}>
          {article.summary}
        </p>
      ) : article.original_content ? (
        <p className="text-xs leading-relaxed line-clamp-3 italic" style={{ color: 'var(--color-text-muted)' }}>
          {article.original_content.slice(0, 200)}...
        </p>
      ) : null}

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-xs font-medium hover:underline w-fit"
        style={{ color: 'var(--color-primary)' }}
      >
        원문 보기 →
      </a>
    </article>
  );
}
