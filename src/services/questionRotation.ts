/**
 * Current rotation: use *concepts* rather than display text, with one shared history
 * for specific-topic and subject-wide practice. Browser/profile scoped only.
 * Fresh-only mode NEVER silently replays previously seen material. The caller
 * must explicitly offer a review/restart when the finite pool is exhausted.
 */
export interface RotatingItem {
  text: string;
  id?: string;
  skill?: string;
  passageId?: string;
  conceptId?: string;
  /** The topic an item belongs to when mixing several topics. */
  rotationTopicId?: string;
}
export interface RotateOptions {
  strictNew?: boolean;
  relatedScopes?: readonly string[];
  /** Subject-wide history scope, used to link focused and mixed practice. */
  sharedScope?: string;
  distributeTopics?: boolean;
  /** Rotate task types/skills as well as topics to avoid monotonous worksheets. */
  distributeSkills?: boolean;
}
const PREFIX_V1 = 'hocvui:question-rotation:v1:';
const PREFIX_V2 = 'hocvui:question-rotation:concept-v2:';
const MAX_HISTORY = 6000;
const memory = new Map<string, string[]>();
export const questionIdentity = (text: string): string =>
  text.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi-VN');

export function questionConceptIdentity(item: RotatingItem): string {
  if (item.conceptId) return `concept:${questionIdentity(item.conceptId)}`;
  if (item.passageId) return `passage:${item.rotationTopicId ? questionIdentity(item.rotationTopicId)+':' : ''}${questionIdentity(item.passageId)}`;
  if (item.skill && /^(từ-vựng-|tu-vung-)/u.test(item.skill)) {
    return `vocabulary:${item.rotationTopicId ? questionIdentity(item.rotationTopicId)+':' : ''}${questionIdentity(item.skill)}`;
  }
  return `question:${questionIdentity(item.text)}`;
}
function loadHistory(key: string): string[] {
  let result = memory.get(key) || [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) result = parsed.filter((x): x is string => typeof x === 'string').slice(-MAX_HISTORY);
      }
    }
  } catch { /* Private browsing or unavailable localStorage. */ }
  return result;
}
function saveHistory(key: string, values: readonly string[]) {
  const result = [...new Set(values)].slice(-MAX_HISTORY);
  memory.set(key, result);
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, JSON.stringify(result));
  } catch { /* Best effort only; no persistence without browser storage. */ }
}
function shuffled<T>(input: readonly T[]): T[] {
  const values = [...input];
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
const keyFor = (prefix: string, profile: string, scope: string) =>
  `${prefix}${encodeURIComponent(profile)}:${encodeURIComponent(scope)}`;

/** Computes fresh concept count using *the same* history logic as the picker. */
export function countUnseenConcepts<T extends RotatingItem>(items: readonly T[], profileId: string | undefined, scope: string, options: RotateOptions = {}): number {
  const ids = new Set(items.map(questionConceptIdentity));
  if (!profileId || !scope) return ids.size;
  const scopes = [...new Set([scope, ...(options.relatedScopes || [])])];
  const byText = new Map(items.map(q => [questionIdentity(q.text), questionConceptIdentity(q)]));
  const seen = new Set<string>();
  for (const s of scopes) {
    for (const c of loadHistory(keyFor(PREFIX_V2, profileId, s))) seen.add(c);
    for (const t of loadHistory(keyFor(PREFIX_V1, profileId, s))) seen.add(byText.get(t) || `question:${t}`);
  }
  return [...ids].filter(id => !seen.has(id)).length;
}

/**
 * A session samples at most one question from each educational concept.
 * With strictNew=true, if everything is seen, return [] and let the UI show
 * an honest exhausted-state message. No automatic recycling or disguised clones.
 */
export function rotateQuestions<T extends RotatingItem>(
  items: readonly T[], limit: number, profileId: string | undefined, scope: string, options: RotateOptions = {}
): T[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const byText = new Map<string, T>();
  for (const item of items) {
    const text = questionIdentity(item.text);
    if (text && !byText.has(text)) byText.set(text, item);
  }
  const groups = new Map<string, T[]>();
  for (const item of shuffled([...byText.values()])) {
    const concept = questionConceptIdentity(item);
    if (!groups.has(concept)) groups.set(concept, []);
    groups.get(concept)!.push(item);
  }
  if (!groups.size) return [];
  const scopes = [...new Set([scope, ...(options.relatedScopes || [])])];
  const textToConcept = new Map([...byText.values()].map(q => [questionIdentity(q.text), questionConceptIdentity(q)]));
  const seenConcepts: string[] = [];
  const seenTexts: string[] = [];
  if (profileId) for (const s of scopes) {
    const old = loadHistory(keyFor(PREFIX_V1, profileId, s));
    const known = loadHistory(keyFor(PREFIX_V2, profileId, s));
    for (const c of [...known, ...old.map(x => textToConcept.get(x) || `question:${x}`)]) {
      if (!seenConcepts.includes(c)) seenConcepts.push(c);
    }
    for (const t of old) if (!seenTexts.includes(t)) seenTexts.push(t);
  }
  const candidates = shuffled([...groups.keys()].filter(c => !seenConcepts.includes(c) && (!options.strictNew || groups.get(c)!.some(q => !seenTexts.includes(questionIdentity(q.text))))));
  if (!options.strictNew) {
    const old = [...groups.keys()].filter(c => seenConcepts.includes(c));
    old.sort((a, b) => seenConcepts.indexOf(a) - seenConcepts.indexOf(b));
    candidates.push(...old);
  }
  // Balanced 2D picker: spread over curriculum topics and pedagogic skill tags.
  // A large bank of nearly identical letter/grammar tasks should not crowd out
  // reading, reasoning, and application tasks in the same lesson.
  let selectedConcepts: string[];
  if (options.distributeTopics || options.distributeSkills) {
    const topics = new Map<string, Map<string, string[]>>();
    for (const c of candidates) {
      const item = groups.get(c)![0];
      const topic = options.distributeTopics ? item.rotationTopicId || 'unknown' : 'all';
      const skill = options.distributeSkills ? item.skill || item.passageId || 'other' : 'all';
      if (!topics.has(topic)) topics.set(topic, new Map());
      const sub=topics.get(topic)!;
      if (!sub.has(skill)) sub.set(skill,[]);
      sub.get(skill)!.push(c);
    }
    const roundRobin=(buckets: string[][]) => {
      const ordered: string[]=[];
      while (buckets.some(x=>x.length)) for (const bucket of buckets) if (bucket.length) ordered.push(bucket.shift()!);
      return ordered;
    };
    const topicQueues=shuffled([...topics.values()]).map(skillBuckets=>roundRobin(shuffled([...skillBuckets.values()])));
    selectedConcepts=roundRobin(topicQueues).slice(0,Math.floor(limit));
  } else selectedConcepts = candidates.slice(0, Math.floor(limit));

  const result: T[] = [];
  for (const concept of selectedConcepts) {
    const alternatives = groups.get(concept)!;
    const unseenText = alternatives.find(q => !seenTexts.includes(questionIdentity(q.text)));
    result.push(unseenText || alternatives[0]);
  }
  if (profileId && scope && result.length) {
    const persist = (s: string, chosen: readonly T[]) => {
      if (!chosen.length) return;
      const ck = keyFor(PREFIX_V2, profileId, s);
      const tk = keyFor(PREFIX_V1, profileId, s);
      const concepts = chosen.map(questionConceptIdentity);
      const texts = chosen.map(x => questionIdentity(x.text));
      saveHistory(ck, [...loadHistory(ck).filter(x => !concepts.includes(x)), ...concepts]);
      saveHistory(tk, [...loadHistory(tk).filter(x => !texts.includes(x)), ...texts]);
    };
    persist(scope, result);
    if (options.sharedScope && scope !== options.sharedScope) persist(options.sharedScope, result);
    // Mixed practice updates each item's original topic, so subsequent focused
    // practice cannot unknowingly repeat the very same material.
    const perTopic = new Map<string, T[]>();
    for (const item of result) {
      if (!item.rotationTopicId || item.rotationTopicId === scope) continue;
      if (!perTopic.has(item.rotationTopicId)) perTopic.set(item.rotationTopicId, []);
      perTopic.get(item.rotationTopicId)!.push(item);
    }
    perTopic.forEach((selected, topic) => persist(topic, selected));
  }
  return shuffled(result);
}

/** Warn users when no browser history can survive a page reload. */
export function isRotationHistoryPersistent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (!window.localStorage) return false;
    const key='hocvui:history-storage-test';
    window.localStorage.setItem(key,'ok');
    const ok=window.localStorage.getItem(key)==='ok';
    window.localStorage.removeItem(key);
    return ok;
  } catch { return false; }
}
