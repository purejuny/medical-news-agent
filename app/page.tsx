'use client';

import { useCallback, useEffect, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import SourceFilter from '@/components/SourceFilter';
import type { Article, NewsResponse } from '@/types';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('all');
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collectMsg, setCollectMsg] = useState('');

  const fetchNews = useCallback(
    async (src: string, pg: number, reset = false) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/news?source=${src}&page=${pg}`);
        const data: NewsResponse = await res.json();
        setArticles((prev) => (reset ? data.articles : [...prev, ...data.articles]));
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchNews(source, 1, true);
  }, [source, fetchNews]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNews(source, next, false);
  };

  const handleCollect = async () => {
    setCollecting(true);
    setCollectMsg('');
    try {
      const res = await fetch('/api/collect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCollectMsg(`완료: 수집 ${data.crawled}건, 신규 ${data.newArticles}건, 요약 ${data.summarized}건`);
        setPage(1);
        fetchNews(source, 1, true);
      } else {
        setCollectMsg(`오류: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      setCollectMsg(`오류: ${err instanceof Error ? err.message : '네트워크 오류'}`);
    } finally {
      setCollecting(false);
    }
  };

  const hasMore = articles.length < total;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{ background: 'rgba(15,23,42,0.9)', borderColor: 'var(--color-surface-3)' }}>
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-bold"
              style={{ background: 'var(--color-primary)' }}>
              +
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                의료 뉴스 Agent
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                최신 질병 정보 자동 수집 · AI 요약
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {collectMsg && (
              <span className="text-xs px-3 py-1.5 rounded-lg hidden sm:block"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                {collectMsg}
              </span>
            )}
            <button
              onClick={handleCollect}
              disabled={collecting}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-60 cursor-pointer"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              {collecting ? '수집 중...' : '뉴스 수집'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            총{' '}
            <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
              {total.toLocaleString()}
            </span>
            건의 뉴스
          </p>
          {collectMsg && (
            <span className="text-xs sm:hidden" style={{ color: 'var(--color-text-muted)' }}>
              {collectMsg}
            </span>
          )}
        </div>

        {/* Source filter */}
        <div className="mb-8">
          <SourceFilter active={source} onChange={setSource} />
        </div>

        {/* Articles grid */}
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl animate-pulse"
                style={{ background: 'var(--color-surface-2)' }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="text-5xl">📰</div>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              뉴스가 없습니다
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              상단의 <strong>뉴스 수집</strong> 버튼을 눌러 최신 기사를 가져오세요.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-surface-3)' }}
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8 text-center"
        style={{ borderColor: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }}>
        <p className="text-xs">
          자동 수집: WHO · CDC · NIH · PubMed · MedicalXpress · Google News · Reuters · 6시간마다 업데이트
        </p>
      </footer>
    </div>
  );
}
