// Today's Krillion puzzle for offline/krillion.html, the same way OpenKrillion gets it:
// prompts from krillion.io/api/today, answer tiers from /api/reveal for that date.
// krillion.io sends no CORS header, so the game can't read it directly; this relays it once per
// cache period. The answer lists are big (often 100,000+ entries), so the reply is gzip bytes the
// game unpacks itself, which keeps it under Vercel's 4.5 MB response limit.
const zlib = require('zlib');

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; KrillionOffline/1.0)', Accept: 'application/json' };
const TIERS = ['plankton', 'tooclever', 'schooler', 'rare', 'deepcut', 'krillion'];

async function getJson(url) {
  const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(url.split('?')[0] + ' answered ' + r.status);
  return r.json();
}

function pack(today, reveal) {
  if (!today || !reveal || today.date !== reveal.date || today.prompts?.length !== 7 || reveal.prompts?.length !== 7) throw new Error('Puzzle date or round count mismatch');
  return {
    date: today.date,
    dayNumber: today.dayNumber,
    resetsAt: Date.parse(today.resetsAt) || null,
    prompts: today.prompts.map(p => {
      const source = reveal.prompts.find(r => r.id === p.id && r.text === p.text);
      if (!source?.answers?.length) throw new Error('Missing answers for ' + p.id);
      const tiers = {}, quips = {};
      for (const a of source.answers) {
        if (typeof a.answer !== 'string' || !TIERS.includes(a.tier)) continue;
        const aliases = Array.isArray(a.aliases) ? a.aliases.filter(x => typeof x === 'string' && !x.includes('\u0001')) : [];
        (tiers[a.tier] = tiers[a.tier] || []).push([a.answer, ...aliases].join('\u0001'));
        if (typeof a.quip === 'string' && a.quip) quips[a.answer] = a.quip;
      }
      return { id: p.id, text: p.text, tiers, quips };
    }),
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  try {
    const today = await getJson('https://krillion.io/api/today');
    const reveal = await getJson('https://krillion.io/api/reveal?date=' + encodeURIComponent(today.date));
    const puzzle = pack(today, reveal);
    const body = zlib.gzipSync(Buffer.from(JSON.stringify(puzzle)), { level: 9 });
    // never keep a puzzle in the cache past its reset time
    const left = puzzle.resetsAt ? Math.floor((puzzle.resetsAt - Date.now()) / 1000) : 600;
    const ttl = Math.max(30, Math.min(1800, left));
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', `public, max-age=${Math.min(ttl, 300)}, s-maxage=${ttl}, stale-while-revalidate=60`);
    res.statusCode = 200;
    res.end(body);
  } catch (e) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
