import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com").replace(/\/$/, "");
}

export function publicCatalogUrl(shareSlug) {
  if (!shareSlug) return null;
  return `${appBaseUrl()}/k/${shareSlug}`;
}

function randomSegment(len) {
  const buf = randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i += 1) s += ALPHANUM[buf[i] % ALPHANUM.length];
  return s;
}

/** Benzersiz katalog paylaşım kodu (yaklaşık 8 karakter). */
export async function createUniqueShareSlug(tx = prisma) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const slug = randomSegment(8);
    const clash = await tx.catalog.findFirst({
      where: { shareSlug: slug },
      select: { id: true },
    });
    if (!clash) return slug;
  }
  throw new Error("shareSlug üretilemedi");
}
