// SCHEDULED Netlify function (outside Next): daily purge of the "ai-quota" store.
// Netlify Blobs has no TTL: without this purge, every day leaves ~1 key per active IP.
// Deletes the day directories < today (quota time zone, UTC by default), in batches, within a time budget
// below the execution limit of a scheduled function; the rest goes to the next run.
// Imports only pure code (no "server-only", which would throw outside the Next bundler).
import { getStore } from "@netlify/blobs";
import { resolveTimeZone } from "../../lib/day";
import { quotaDay, staleDays } from "../../lib/ai/quota-pure";

const BUDGET_MS = 25_000;
const BATCH = 50;

export default async function purgeAiQuota(): Promise<void> {
    const started = Date.now();
    const store = getStore("ai-quota");
    const { directories } = await store.list({ directories: true });
    let deleted = 0;
    for (const day of staleDays(directories, quotaDay(started, resolveTimeZone(process.env.NEXT_PUBLIC_AI_QUOTA_TZ)))) {
        for await (const page of store.list({
            prefix: `${day}/`,
            paginate: true,
        })) {
            for (let i = 0; i < page.blobs.length; i += BATCH) {
                if (Date.now() - started > BUDGET_MS) {
                    console.warn(
                        `[ai:quota-purge] budget épuisé, ${deleted} clés supprimées, suite au prochain passage`,
                    );
                    return;
                }
                const batch = page.blobs.slice(i, i + BATCH);
                await Promise.all(batch.map((blob) => store.delete(blob.key)));
                deleted += batch.length;
            }
        }
    }
    console.log(`[ai:quota-purge] ${deleted} clés supprimées`);
}

export const config = { schedule: "@daily" };
