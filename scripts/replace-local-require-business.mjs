import fs from "fs";
import path from "path";

const targets = [
  "src/app/api/business/open-status/route.js",
  "src/app/api/business/products/route.js",
  "src/app/api/business/products/[id]/route.js",
  "src/app/api/business/products/bulk-delete/route.js",
  "src/app/api/business/product-categories/route.js",
  "src/app/api/business/product-categories/[id]/route.js",
];

const fnBlock =
  /async function requireBusiness\(\) \{[\s\S]*?return \{ businessId \};\n\}\n\n?/g;

for (const rel of targets) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  if (!fnBlock.test(content)) continue;
  fnBlock.lastIndex = 0;

  content = content.replace(fnBlock, "");

  if (!content.includes("requireBusinessSession")) {
    const importLine =
      'import { requireBusinessSession } from "@/lib/require-business-api";\n';
    const firstImport = content.indexOf("import ");
    if (firstImport >= 0) {
      const end = content.indexOf("\n", firstImport) + 1;
      content = content.slice(0, end) + importLine + content.slice(end);
    } else {
      content = importLine + content;
    }
  }

  content = content.replace(
    /await requireBusiness\(\)/g,
    "await requireBusinessSession()",
  );

  content = content.replace(
    /import \{ canCallBusinessApi \} from "@\/lib\/session-business-access";\n/g,
    "",
  );
  content = content.replace(
    /import \{ getServerSession \} from "next-auth";\nimport \{ authOptions \} from "@\/lib\/auth";\n/g,
    "",
  );

  fs.writeFileSync(file, content);
  console.log("fixed", rel);
}
