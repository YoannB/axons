import { resetDevQuota } from "@/lib/ai/quota";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
// DEV ONLY: resets the server AI quota (memory store). Called by the
// "Reset limiter (dev)" button together with the client counter reset. Outside `next dev`: 404, and
// resetDevQuota() refuses in production anyway (the Blobs store is never touched).
export async function POST() {
    if (process.env.NODE_ENV !== "development" || !resetDevQuota()) {
        return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
