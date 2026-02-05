import esbuild from "esbuild";
import process from "node:process";

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  target: "es2020",
  platform: "browser",
  external: ["obsidian"],
  outfile: "main.js",
  sourcemap: isWatch ? "inline" : false,
  logLevel: "info"
};

if (isWatch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("[copy-location] watching...");
} else {
  await esbuild.build(options);
}

