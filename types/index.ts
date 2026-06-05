export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  source_url?: string;
  original_content?: string;
  summary?: string;
  published_at?: string;
  collected_at: string;
  category: string;
  tags: string[];
  is_summarized: boolean;
}

export type NewsSource = 'WHO' | 'CDC' | 'NIH' | 'PubMed' | 'MedicalXpress' | 'GoogleNews' | 'Reuters';

export interface RawArticle {
  title: string;
  url: string;
  source: NewsSource;
  source_url: string;
  content?: string;
  published_at?: Date;
}

export interface CollectResult {
  success: boolean;
  crawled: number;
  newArticles: number;
  summarized: number;
  errors: string[];
}

export interface NewsResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}
