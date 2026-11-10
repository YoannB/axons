"use client";
import { GTM_ID } from "@/constants/site";
import { useConsent } from "@/hooks/use-store";
import { useEffect } from "react";

let injected = false;

export function GtmScript() {
    const consent = useConsent();
    useEffect(() => {
        if (!GTM_ID || !consent?.analytics || injected) return;
        injected = true;
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
        document.head.appendChild(s);
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    }, [consent]);
    return null;
}
