import { titleSize, type OgImageProps } from "@/lib/og/model";

// Axons' default social image (1200x630), drawn by Satori through `next/og`: flexbox only, inline
// styles, every element with several children is `display: flex`, no CSS variables and no MUI.
// Texts arrive localized and already fitted (lib/og/render.tsx); colours come from the site's
// `SITE_OG_IMAGE.theme` (site/og-image.tsx). A site draws its own by replacing `Image` there.
export function DefaultOgImage({
    title,
    description,
    section,
    siteName,
    host,
    locale,
    logo,
    cover,
    theme,
    fontFamily,
}: OgImageProps) {
    return (
        <div
            lang={locale}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                padding: "56px 64px",
                fontFamily,
                color: theme.text,
                backgroundColor: theme.background,
                backgroundImage: `radial-gradient(circle at 92% 0%, ${theme.accent1}55 0%, transparent 46%), radial-gradient(circle at 0% 100%, ${theme.accent2}33 0%, transparent 42%)`,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- Satori markup, not a page */}
                    <img src={logo} width={64} height={64} alt="" style={{ borderRadius: 14 }} />
                    <div style={{ display: "flex", marginLeft: 20, fontSize: 36, fontWeight: 700 }}>{siteName}</div>
                </div>
                {section ? (
                    <div
                        style={{
                            display: "flex",
                            padding: "8px 22px",
                            borderRadius: 999,
                            fontSize: 26,
                            fontWeight: 700,
                            color: theme.text,
                            backgroundColor: theme.surface,
                            border: `2px solid ${theme.accent1}`,
                        }}
                    >
                        {section}
                    </div>
                ) : null}
            </div>

            <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: titleSize(title),
                            fontWeight: 700,
                            lineHeight: 1.12,
                            letterSpacing: -1,
                        }}
                    >
                        {title}
                    </div>
                    {description ? (
                        <div
                            style={{
                                display: "flex",
                                marginTop: 24,
                                fontSize: 30,
                                lineHeight: 1.35,
                                color: theme.muted,
                            }}
                        >
                            {description}
                        </div>
                    ) : null}
                </div>
                {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Satori markup, not a page
                    <img
                        src={cover}
                        width={340}
                        height={340}
                        alt=""
                        style={{
                            marginLeft: 48,
                            borderRadius: 24,
                            objectFit: "cover",
                            border: `2px solid ${theme.surface}`,
                        }}
                    />
                ) : null}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", fontSize: 28, color: theme.muted }}>{host}</div>
                <div
                    style={{
                        display: "flex",
                        width: 240,
                        height: 8,
                        borderRadius: 999,
                        backgroundImage: `linear-gradient(90deg, ${theme.accent1}, ${theme.accent2})`,
                    }}
                />
            </div>
        </div>
    );
}
