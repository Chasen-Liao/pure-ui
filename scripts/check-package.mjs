import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packArgs = ["pack", "--dry-run", "--json", "--ignore-scripts"];
const command = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npm";
const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...packArgs] : packArgs;
const output = execFileSync(command, args, {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  encoding: "utf8",
});
const report = JSON.parse(output);
const pack = Array.isArray(report) ? report[0] : Object.values(report)[0];
const files = pack.files.map(({ path }) => path).sort();
const expected = [
  "CHANGELOG.md",
  "LICENSE",
  "README.en.md",
  "README.md",
  "package.json",
  "src/bash-block.ts",
  "src/container-hooks.ts",
  "src/index.ts",
  "src/info-visibility-state.ts",
  "src/info-visibility.ts",
  "src/muted.ts",
  "src/thinking-block-merger.ts",
].sort();

if (JSON.stringify(files) !== JSON.stringify(expected)) {
  console.error("Unexpected npm package contents:");
  console.error(files.join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${pack.filename}: ${files.length} reviewed files, ${pack.size} bytes packed.`,
);
