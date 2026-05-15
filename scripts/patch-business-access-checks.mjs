import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "src");
const files = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(js|jsx)$/.test(name)) files.push(full);
  }
}

walk(root);

const pattern = /!\["BUSINESS", "ADMIN"\]\.includes\(session\.user\.role\)/g;
const importLine =
  'import { canCallBusinessApi } from "@/lib/session-business-access";\n';

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (!pattern.test(content)) continue;
  pattern.lastIndex = 0;

  content = content.replace(
    pattern,
    "!canCallBusinessApi(session.user)",
  );

  if (!content.includes("canCallBusinessApi")) continue;
  if (!content.includes("@/lib/session-business-access")) {
    const match = content.match(/^import .+;\n/gm);
    if (match?.length) {
      const last = match[match.length - 1];
      const idx = content.indexOf(last) + last.length;
      content = content.slice(0, idx) + importLine + content.slice(idx);
    } else {
      content = importLine + content;
    }
  }

  fs.writeFileSync(file, content);
  console.log("patched", path.relative(process.cwd(), file));
}
