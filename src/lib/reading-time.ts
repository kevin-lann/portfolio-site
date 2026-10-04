export const READING_WORDS_PER_MINUTE = 200;

export function getReadingTimeMinutes(body: string | undefined | null, wpm = READING_WORDS_PER_MINUTE): number {
  if (!body || !body.trim()) return 1;

  const text = body
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ' '))
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`~_\-|:]/g, ' ');

  const words = text.trim().split(/\s+/).filter(Boolean);

  return Math.max(1, Math.ceil(words.length / wpm));
}

export function getReadingTimeLabel(body: string | undefined | null, wpm = READING_WORDS_PER_MINUTE): string {
  const minutes = getReadingTimeMinutes(body, wpm);
  return `${minutes} min read`;
}
