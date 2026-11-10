import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Хуучин статик хувилбар ба Apps Script — шилжүүлэлтийн хүрээнээс гадуур
    "legacy/**",
    "google-form/**",
  ]),
]);

export default eslintConfig;
