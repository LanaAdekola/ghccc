'use client';

import {useState} from 'react';
import {track} from './analytics';
import {getYouTubeId} from '@/lib/youtube';

export {getYouTubeId};

interface YouTubeEmbedProps {
  url: string;
  title: string;
  aspectRatio?: string;
  className?: string;
}

export default function YouTubeEmbed({url, title, aspectRatio = '16 / 9', className = ''}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <a className="button" href={url} target="_blank" rel="noreferrer">
        Watch on YouTube
      </a>
    );
  }

  const handlePlay = () => {
    setIsPlaying(true);
    track('sermon_play_requested');
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      className={`video-embed-container ${className}`.trim()}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        borderRadius: 'var(--radius, 6px)',
        background: '#000',
      }}
    >
      {isPlaying ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0}}
        />
      ) : (
        <button
          type="button"
          onClick={handlePlay}
          className="video-facade-button"
          aria-label={`Play sermon: ${title}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            background: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg) center/cover no-repeat`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="yt-play-button"
            style={{
              width: 68,
              height: 48,
              background: '#FF0000',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transition: 'transform 0.2s, background 0.2s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

