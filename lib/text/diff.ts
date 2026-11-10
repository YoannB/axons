// Pure word-level diff between a "before" and an "after" text (no React, no DOM, no IO).
// Generic building block for any tool that shows what a rewrite changed: proofreading,
// rephrasing, translation review, template filling. Rendering lives in components/ui/DiffView.

export type DiffOpType = "equal" | "insert" | "delete" | "replace";

export interface DiffOp {
    type: DiffOpType;
    /** Displayed text: the new one for insert/replace, the old one for delete, unchanged for equal. */
    text: string;
    /** Previous text, only for replace (tooltip / accessible label). */
    old?: string;
}

const WS = /^\s+$/;
const PUNCT = /^[^\p{L}\p{N}\s]+$/u;
const WORD = /[\p{L}\p{N}]/u;

export const isWhitespace = (t: string): boolean => WS.test(t);
export const isPunctuation = (t: string): boolean => PUNCT.test(t);
export const isWord = (t: string): boolean => WORD.test(t);

/** Splits on whitespace (kept as tokens), then isolates punctuation runs from words. */
export function tokenize(s: string): string[] {
    const out: string[] = [];
    for (const chunk of s.split(/(\s+)/)) {
        if (chunk === "") continue;
        if (isWhitespace(chunk)) {
            out.push(chunk);
            continue;
        }
        // A non-whitespace chunk always holds at least one letter/digit or punctuation char,
        // so the match is never null.
        out.push(...(chunk.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}\s]+/gu) as RegExpMatchArray));
    }
    return out;
}

// Bounded memo: the LCS compares the same tokens O(n*m) times. Cleared past the cap so a long
// browser session cannot grow it forever.
const SKELETON_CACHE_MAX = 5000;
const skeletonCache = new Map<string, string>();

/** Case-, accent- and apostrophe-insensitive form of a token, used to align corrected words. */
export function skeletonOf(token: string): string {
    const hit = skeletonCache.get(token);
    if (hit !== undefined) return hit;
    if (skeletonCache.size >= SKELETON_CACHE_MAX) skeletonCache.clear();
    const value = token
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/['’`]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
    skeletonCache.set(token, value);
    return value;
}

/**
 * Word-level LCS, then delete+insert fused into replace, then whitespace normalization.
 * Alignment equality = identical raw token OR two words with the same skeleton: this keeps
 * an inserted comma next to a corrected word from shifting the alignment and fabricating
 * fake rewrites. Same skeleton but different raw text (accent/case fixed) => a `replace`,
 * so the fix stays visible instead of hiding behind an `equal`.
 * Complexity O(n*m) in tokens: bound the input length upstream (Textarea `maxLength`).
 */
export function diffWords(before: string, after: string): DiffOp[] {
    const a = tokenize(before);
    const b = tokenize(after);
    const n = a.length;
    const m = b.length;
    const aWord = a.map(isWord);
    const bWord = b.map(isWord);
    const aSkel = a.map((t, i) => (aWord[i] ? skeletonOf(t) : ""));
    const bSkel = b.map((t, j) => (bWord[j] ? skeletonOf(t) : ""));
    const eq = (i: number, j: number) => a[i] === b[j] || (aWord[i] && bWord[j] && aSkel[i] === bSkel[j]);

    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--)
            dp[i][j] = eq(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

    const raw: DiffOp[] = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (eq(i, j)) {
            raw.push(a[i] === b[j] ? { type: "equal", text: a[i] } : { type: "replace", text: b[j], old: a[i] });
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            raw.push({ type: "delete", text: a[i++] });
        } else {
            raw.push({ type: "insert", text: b[j++] });
        }
    }
    while (i < n) raw.push({ type: "delete", text: a[i++] });
    while (j < m) raw.push({ type: "insert", text: b[j++] });

    const out: DiffOp[] = [];
    for (let k = 0; k < raw.length; k++) {
        const cur = raw[k];
        const next = raw[k + 1];
        // Only two non-whitespace tokens fuse into a replace: a whitespace change stays an
        // explicit delete/insert, so both rebuild functions remain lossless.
        if (cur.type === "delete" && next?.type === "insert" && !isWhitespace(cur.text) && !isWhitespace(next.text)) {
            out.push({ type: "replace", text: next.text, old: cur.text });
            k++;
        } else out.push(cur);
    }
    return out;
}

/** The "after" text rebuilt from the ops (everything except deletions). */
export function rebuildAfter(ops: DiffOp[]): string {
    return ops
        .filter((o) => o.type !== "delete")
        .map((o) => o.text)
        .join("");
}

/** The "before" text rebuilt from the ops (everything except insertions). */
export function rebuildBefore(ops: DiffOp[]): string {
    return ops
        .filter((o) => o.type !== "insert")
        .map((o) => (o.type === "replace" ? (o.old as string) : o.text))
        .join("");
}
