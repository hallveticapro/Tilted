import { accessSync, constants, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), "utf8");
const assertIncludes = (content, value, source) => {
  if (!content.includes(value)) {
    throw new Error(`${source} is missing ${value}`);
  }
};
const assertMatches = (content, pattern, source) => {
  if (!pattern.test(content)) {
    throw new Error(`${source} does not match ${pattern}`);
  }
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const securityHeaders = JSON.parse(read("config/security-headers.json"));

function assertHeaderValues(source, content, strategy) {
  for (const [header, value] of Object.entries(securityHeaders)) {
    if (strategy === "nginx") {
      assertMatches(
        content,
        new RegExp(`add_header\\s+${escapeRegExp(header)}\\s+"${escapeRegExp(value)}"\\s+always;`),
        source,
      );
    } else if (strategy === "headers") {
      assertIncludes(content, `${header}: ${value}`, source);
    } else if (strategy === "vercel") {
      assertIncludes(content, `"key": "${header}", "value": "${value}"`, source);
    }
  }
}

const index = read("dist/index.html");
const serviceWorker = read("dist/sw.js");
const nginx = read("deploy/nginx.conf");
const staticHeaders = read("dist/_headers");
const vercel = read("vercel.json");

assertHeaderValues("deploy/nginx.conf", nginx, "nginx");
assertHeaderValues("dist/_headers", staticHeaders, "headers");
assertHeaderValues("vercel.json", vercel, "vercel");

assertIncludes(nginx, "location = /healthz", "deploy/nginx.conf");
assertMatches(serviceWorker, /const CACHE_NAME = "tilted-shell-[a-f0-9]{12}"/, "dist/sw.js");
assertIncludes(serviceWorker, "if (response.ok)", "dist/sw.js");
assertIncludes(serviceWorker, 'type === "SKIP_WAITING"', "dist/sw.js");
assertIncludes(index, 'property="og:image"', "dist/index.html");
assertIncludes(index, 'name="twitter:card"', "dist/index.html");
assertIncludes(index, 'property="og:url" content="https://', "dist/index.html");
assertIncludes(staticHeaders, "Cache-Control: no-cache, must-revalidate", "dist/_headers");
assertMatches(
  nginx,
  /location = \/sw\.js \{[\s\S]*add_header\s+Cache-Control\s+"no-cache, must-revalidate"\s+always;[\s\S]*\}/,
  "deploy/nginx.conf",
);
assertIncludes(vercel, '"Cache-Control", "value": "no-cache, must-revalidate"', "vercel.json");

if (index.includes("__TILTED_")) {
  throw new Error("dist/index.html still contains an unresolved social metadata placeholder");
}
if (index.includes("https://github.com/hallveticapro/Tilted")) {
  throw new Error("dist/index.html still points social metadata at the GitHub fallback URL");
}
if (serviceWorker.includes("__CACHE_VERSION__")) {
  throw new Error("dist/sw.js still contains an unresolved cache placeholder");
}

accessSync(join(root, "deploy/40-runtime-metadata.sh"), constants.X_OK);
console.log("Static bundle verification passed.");
