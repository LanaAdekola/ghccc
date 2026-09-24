'use client';

import {useEffect, useRef, useState} from 'react';

interface StatItem {
  number: number;
  suffix?: string;
  label: string;
}

const defaultStats: StatItem[] = [
  {number: 15, suffix: '+', label: 'Years in Ministry'},
  {number: 7000, suffix: '+', label: 'Songs Written'},
  {number: 3000, suffix: '+', label: 'Sermons Preached'},
];

export default function AnimatedStats({stats = defaultStats}: {stats?: StatItem[]}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(stats.map(stat => stat.number));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts(stats.map((s) => Math.floor(s.number * easeOut)));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCounts(stats.map((s) => s.number));
            }
          };

          requestAnimationFrame(step);
        }
      },
      {threshold: 0.25}
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stats]);

  return (
    <section className="pastor-stats" ref={containerRef}>
      <div className="pastor-stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-item" key={stat.label}>
            <span className="stat-number">
              {`${counts[i].toLocaleString()}${stat.suffix || ''}`}
            </span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

