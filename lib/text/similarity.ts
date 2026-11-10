// Pure similarity score derived from a word diff, plus configurable score bands.
// Generic: "how much did the rewrite change?" for any before/after text tool. What a band
// MEANS (labels, legal verdicts such as an AI-disclosure rule) belongs to the app, in
// messages/ and in its own code; this module only measures and buckets.
import { isWhitespace, type DiffOp } from "./diff";

export interface DiffStats {
    inserted: number;
    deleted: number;
    replaced: number;
    /** inserted + deleted + replaced, whitespace-only ops excluded. */
    changed: number;
}

/** Counts the meaningful edits; whitespace-only insertions/deletions are ignored. */
export function diffStats(ops: DiffOp[]): DiffStats {
    let inserted = 0;
    let deleted = 0;
    let replaced = 0;
    for (const op of ops) {
        if (op.type === "replace") replaced++;
        else if (op.type === "equal" || isWhitespace(op.text)) continue;
        else if (op.type === "insert") inserted++;
        else deleted++;
    }
    return { inserted, deleted, replaced, changed: inserted + deleted + replaced };
}

const wordCount = (s: string): number => s.split(/\s+/).filter(Boolean).length;

/**
 * Similarity in [0, 100], rounded: 100 = untouched. One edit costs one unit against the
 * word count of the longer side (at least 1, so two empty texts are 100% similar).
 */
export function similarityPercent(ops: DiffOp[], before: string, after: string): number {
    const denom = Math.max(wordCount(before), wordCount(after), 1);
    const pct = Math.round((1 - diffStats(ops).changed / denom) * 100);
    return Math.max(0, Math.min(100, pct));
}

export interface ScoreBand<K extends string = string> {
    key: K;
    /** Inclusive lower bound in [0, 100]. */
    min: number;
}

export type DefaultBandKey = "perfect" | "great" | "good" | "low";

/** Default buckets: 100 / 95-99 / 90-94 / below 90. Apps pass their own to change them. */
export const DEFAULT_BANDS: readonly ScoreBand<DefaultBandKey>[] = [
    { key: "perfect", min: 100 },
    { key: "great", min: 95 },
    { key: "good", min: 90 },
    { key: "low", min: 0 },
];

/**
 * The band with the highest `min` that `percent` reaches. Bands may be given in any order.
 * Throws on an empty list or when no band covers `percent` (authoring error: always
 * include a band with `min: 0`).
 */
export function bandFor<K extends string>(
    percent: number,
    bands: readonly ScoreBand<K>[] = DEFAULT_BANDS as unknown as readonly ScoreBand<K>[],
): ScoreBand<K> {
    const sorted = [...bands].sort((x, y) => y.min - x.min);
    const hit = sorted.find((b) => percent >= b.min);
    if (!hit) throw new Error(`bandFor: no band covers ${percent} (add a band with min: 0)`);
    return hit;
}
