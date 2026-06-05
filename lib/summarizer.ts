import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://medical-news-agent.vercel.app',
        'X-Title': 'Medical News Agent',
      },
    });
  }
  return client;
}

export async function summarizeArticle(title: string, content: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    return content ? content.slice(0, 300) + (content.length > 300 ? '...' : '') : '요약 없음 (API 키 미설정)';
  }

  const text = content || title;
  if (text.length < 50) return text;

  const response = await getClient().chat.completions.create({
    model: 'openrouter/auto',
    messages: [
      {
        role: 'system',
        content:
          '당신은 의료·보건 뉴스 전문 요약가입니다. 주어진 뉴스를 3~4문장으로 간결하게 한국어로 요약하세요. 핵심 정보(질병명, 영향 지역/인구, 주요 발견 사항, 권고 사항)를 반드시 포함하세요. 요약만 출력하고 다른 설명은 하지 마세요.',
      },
      {
        role: 'user',
        content: `제목: ${title}\n\n내용: ${text.slice(0, 2000)}`,
      },
    ],
    max_tokens: 400,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || text.slice(0, 300);
}
