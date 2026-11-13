// @vitest-environment node
// Claude Code keeps session worktrees in .claude/worktrees/* (full checkouts with their own .next,
// storybook-static, node_modules…). No tool of the Definition of done may scan them: ESLint once
// reported ~1.9k errors from them. Each tool is ASKED (its own API), not just its config text.
import { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import { getFileInfo } from "prettier";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import vitestConfig from "../../vitest.config";

const WORKTREE_FILE = ".claude/worktrees/some-session/lib/file.ts";

describe("tooling ignores .claude/** (Claude Code worktrees)", () => {
    it("ESLint ignores it (flat config does not read .gitignore)", async () => {
        expect(await new ESLint().isPathIgnored(WORKTREE_FILE)).toBe(true);
    });

    it("Prettier ignores it (.prettierignore, independently of .gitignore)", async () => {
        const info = await getFileInfo(WORKTREE_FILE, { ignorePath: ".prettierignore" });
        expect(info.ignored).toBe(true);
    });

    it("tsconfig excludes it", () => {
        const { config } = ts.parseConfigFileTextToJson("tsconfig.json", readFileSync("tsconfig.json", "utf8"));
        expect(config.exclude).toContain(".claude");
    });

    it("Vitest excludes it", () => {
        expect(vitestConfig.test?.exclude).toContain(".claude/**");
    });
});
