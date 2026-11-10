// @vitest-environment node
import { cn } from "@/lib/cn";
import { describe, expect, it } from "vitest";

describe("cn — jointure de classes CSS", () => {
    it("retourne une chaîne vide sans partie", () => {
        expect(cn()).toBe("");
    });

    it("joint les parties truthy avec un espace simple", () => {
        expect(cn("alpha", "beta")).toBe("alpha beta");
    });

    it("ignore false, null et undefined", () => {
        expect(cn("a", false, null, undefined, "b")).toBe("a b");
    });

    it("conserve la chaîne '0' car elle est truthy en JavaScript", () => {
        expect(cn("0")).toBe("0");
    });

    it("ne normalise ni ne trimme les espaces internes", () => {
        expect(cn(" a ", "b ")).toBe(" a  b ");
    });
});
