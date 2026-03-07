import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: [
      ".next/**",
      ".source/**",
      "node_modules/**",
      "dist/**",
      "public/**",
    ],
  },
  eslintPluginPrettierRecommended,
];
