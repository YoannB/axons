import { createTheme, type Theme, type ThemeOptions } from "@mui/material/styles";

// The mode IS PASSED AS A PARAMETER (no more hard-coded 'dark'): otherwise CssBaseline paints the
// <body> #121212 and field texts stay light => light mode breaks.
//
// background.default/paper = 'transparent' so that globals.css (--* tokens) keeps
// control over backgrounds, with no cascade war against the Emotion-injected styles.
export function buildTheme(mode: "light" | "dark"): Theme {
    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: { main: "#7c5cff" },
            secondary: { main: "#22d3ee" },
            background: {
                default: "transparent",
                paper: "transparent",
                // MUI v9 cannot derive a channel from 'transparent' (not parsable): the token is
                // explicitly removed to silence the warning, the background being controlled
                // by globals.css (CssBaseline must paint nothing).
                defaultChannel: undefined,
                paperChannel: undefined,
            },
        } as unknown as ThemeOptions["palette"],
        shape: { borderRadius: 12 },
        typography: {
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        fontWeight: 600,
                    },
                },
            },
            MuiCssBaseline: {
                styleOverrides: {
                    root: "html,body{margin:0}",
                },
            },
        },
    });
}

export const theme = buildTheme("dark");
