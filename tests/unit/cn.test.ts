// @vitest-environment node
import { cn } from "@/lib/cn";
import { describe, expect, it } from "vitest";

describe("cn — CSS class joining", () => {
    it("returns an empty string with no part", () => {
        expect(cn()).toBe("");
    });

    it("joins truthy parts with a single space", () => {
        expect(cn("alpha", "beta")).toBe("alpha beta");
    });

    it("ignores false, null and undefined", () => {
        expect(cn("a", false, null, undefined, "b")).toBe("a b");
    });

    it("keeps the string '0' because it is truthy in JavaScript", () => {
        expect(cn("0")).toBe("0");
    });

    it("neither normalizes nor trims inner spaces", () => {
        expect(cn(" a ", "b ")).toBe(" a  b ");
    });
});
