const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../../..");
const webDir = path.join(rootDir, "apps", "web");
const desktopDir = path.join(rootDir, "apps", "desktop");
const outputDir = path.join(desktopDir, "web-dist");

const sourceStandaloneDir = path.join(webDir, ".next", "standalone");
const sourceStaticDir = path.join(webDir, ".next", "static");
const sourcePublicDir = path.join(webDir, "public");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    throw new Error(`Missing required build output: ${from}`);
  }

  fs.cpSync(from, to, { recursive: true, force: true });
}

function main() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);

  copyDir(sourceStandaloneDir, path.join(outputDir, "standalone"));

  const targetStaticDir = path.join(outputDir, "standalone", ".next", "static");
  ensureDir(path.dirname(targetStaticDir));
  copyDir(sourceStaticDir, targetStaticDir);

  if (fs.existsSync(sourcePublicDir)) {
    copyDir(sourcePublicDir, path.join(outputDir, "standalone", "public"));
  }

  process.stdout.write(`Prepared web assets at ${outputDir}\n`);
}

main();
