"use client";
import { useTheme } from "@/hooks/use-theme"; // NEUTRAL hook (no @mui): allowed here
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useMemo, type ReactNode } from "react";
import "./index.css";
import { buildTheme } from "./theme";

// MaterialProviders sits under AppStateProvider (see AppProviders) => useTheme() is available.
// IT sets data-theme on <html> (via useTheme's effect): no more redundant ThemeSync
// in AppProviders. The MUI theme is rebuilt on every light/dark switch.
export function MaterialProviders({ children }: { children: ReactNode }) {
    const { effective } = useTheme();
    const theme = useMemo(() => buildTheme(effective), [effective]);
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}
