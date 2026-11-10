"use client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import "./index.css";
import { theme } from "./theme";
// Variant WITHOUT AppRouterCacheProvider (does not exist outside Next) for Storybook/Vite.
export function StorybookProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
