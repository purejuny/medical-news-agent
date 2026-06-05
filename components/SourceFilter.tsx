'use client';

type Source = {
  key: string;
  label: string;
};

const SOURCES: Source[] = [
  { key: 'all', label: '전체' },
  { key: 'WHO', label: 'WHO' },
  { key: 'CDC', label: 'CDC' },
  { key: 'NIH', label: 'NIH' },
  { key: 'PubMed', label: 'PubMed' },
  { key: 'MedicalXpress', label: 'MedicalXpress' },
  { key: 'GoogleNews', label: 'Google News' },
  { key: 'Reuters', label: 'Reuters' },
];

interface Props {
  active: string;
  onChange: (source: string) => void;
}

export default function SourceFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {SOURCES.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer"
          style={
            active === s.key
              ? { background: 'var(--color-primary)', color: '#fff' }
              : { background: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
