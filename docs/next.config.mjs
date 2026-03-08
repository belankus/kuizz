import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: process.cwd().replace('/docs', ''), // Support turborepo pruning correctly
};

const withMDX = createMDX();

export default withMDX(config);
