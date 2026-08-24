const sentenceBoundary = /([^။၊.!?\n]+[။၊.!?]?|\n+)/g;

function splitOversizedSegment(segment: string, maxCharacters: number) {
  const chunks: string[] = [];
  let remaining = segment.trim();

  while (remaining.length > maxCharacters) {
    const window = remaining.slice(0, maxCharacters + 1);
    const lastSpace = Math.max(window.lastIndexOf(" "), window.lastIndexOf("\n"), window.lastIndexOf("\t"));
    const splitAt = lastSpace > maxCharacters * 0.45 ? lastSpace : maxCharacters;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export function splitScriptIntoChunks(script: string, maxCharacters: number) {
  const normalized = script.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const segments = Array.from(normalized.matchAll(sentenceBoundary))
    .map((match) => match[0].trim())
    .filter(Boolean)
    .flatMap((segment) => splitOversizedSegment(segment, maxCharacters));

  const chunks: string[] = [];
  let current = "";

  for (const segment of segments) {
    const candidate = current ? `${current} ${segment}` : segment;
    if (candidate.length <= maxCharacters) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);
    current = segment;
  }

  if (current) chunks.push(current);
  return chunks;
}
