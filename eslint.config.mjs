import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint 9 flat config（Next 16 原生导出，已弃用 @eslint/eslintrc FlatCompat ——
 * 后者在 eslint 9.39 下会因循环引用崩溃）。
 */
const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".workbuddy/**"],
  },
];

export default eslintConfig;
