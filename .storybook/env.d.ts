// Ambient declaration for CSS side-effect imports in the Storybook context.
// TS2882 comes from the missing '*.css' declaration in the TS program that type-checks
// .storybook/preview.tsx (the editor type-checks it, so it is in the include; this
// .d.ts is therefore included too via **/*.ts and resolves the error). No runtime effect:
// Vite already loads the CSS through its plugin, this is purely for the type checker.
declare module "*.css";
