// Generic CSS class join (no dependency on MUI/Tailwind).
export function cn(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(" ");
}
