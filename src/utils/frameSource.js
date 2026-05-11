export const normalizeFrameSource = (source) => {
  if (!source || typeof source !== 'string') return null;
  if (source.startsWith('data:')) return source;
  if (/^https?:\/\//i.test(source)) return source.replace(/^http:\/\//i, 'https://');
  if (source.startsWith('/')) return `https://api.codingboss.in${source}`;
  return `data:image/jpeg;base64,${source}`;
};

export const getFrameSourceCandidates = (source) => {
  if (!source || typeof source !== 'string') return [];
  if (source.startsWith('data:')) return [source];
  if (!/^https?:\/\//i.test(source) && !source.startsWith('/')) {
    return [`data:image/jpeg;base64,${source}`];
  }

  const candidates = [
    normalizeFrameSource(source),
    source
  ];

  try {
    const url = new URL(source, 'https://api.codingboss.in');
    candidates.push(`https://api.codingboss.in${url.pathname}${url.search}`);
  } catch {
    // Ignore malformed URLs; normalizeFrameSource already produced the best fallback.
  }

  return [...new Set(candidates.filter(Boolean))];
};
