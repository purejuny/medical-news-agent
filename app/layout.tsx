import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '의료 뉴스 Agent',
  description: '최신 질병 정보 자동 수집 및 AI 요약 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
