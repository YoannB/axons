"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ORIGIN = "https://www.youtube-nocookie.com";

// everMounted: becomes true on the first intersection and NEVER goes back to false
// => once mounted, the iframe is never unmounted again (so no more reset to 0).
//
// visible: drives play/pause through the iframe API (postMessage), without unmounting the iframe.
//
// The poster is shown ONLY as long as the iframe has never been mounted.
//
// NOTE: the figcaption is rendered by the parent (SeoResources), in the flow,
// so that the video block placeholder matches the video to the pixel
// (constant block height => no jump of the content below the block when
// switching flow <-> fixed). The `caption` prop is only used for the iframe's
// accessible name (title).
export function VideoEmbed({
    videoId,
    short = false,
    caption,
}: {
    videoId: string;
    short?: boolean;
    caption?: string;
}) {
    const wrapRef = useRef<HTMLElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [everMounted, setEverMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const maxresPoster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackPoster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Poster state derived from props: allows switching to the fallback without going back
    // through a native <img>, and without setState in an effect.
    const [posterState, setPosterState] = useState<{
        videoId: string;
        src: string;
    }>({
        videoId,
        src: maxresPoster,
    });

    // If videoId changes, reset the poster for the new video.
    // This is a state adjustment during render, allowed by React to
    // derive state from props, not a setState in an effect.
    if (posterState.videoId !== videoId) {
        setPosterState({
            videoId,
            src: maxresPoster,
        });
    }

    const posterSrc = posterState.videoId === videoId ? posterState.src : maxresPoster;

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);
                if (entry.isIntersecting) setEverMounted(true);
            },
            { threshold: 0.4 },
        );

        io.observe(el);

        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (!everMounted) return;

        const cmd = visible ? "playVideo" : "pauseVideo";

        iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: cmd, args: "" }),
            ORIGIN,
        );
    }, [visible, everMounted]);

    const src = `${ORIGIN}/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&controls=1`;

    return (
        <figure ref={wrapRef} className={`video-embed ${short ? "is-short" : "is-normal"}`}>
            <div className="video-embed__frame">
                {everMounted ? (
                    <iframe
                        ref={iframeRef}
                        src={src}
                        title={caption ?? videoId}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <Image
                        className="video-embed__poster-img"
                        src={posterSrc}
                        alt=""
                        width={480}
                        height={short ? 853 : 270}
                        sizes="(max-width: 768px) 100vw, 480px"
                        decoding="async"
                        onError={() => {
                            if (posterSrc !== fallbackPoster) {
                                setPosterState({
                                    videoId,
                                    src: fallbackPoster,
                                });
                            }
                        }}
                    />
                )}
            </div>
        </figure>
    );
}
