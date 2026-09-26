export function getYouTubeId(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    let id;
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|v|shorts)\/([\w-]{11})$/)?.[1];
    }
    return typeof id === 'string' && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
