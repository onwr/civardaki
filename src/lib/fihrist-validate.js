import { prisma } from "@/lib/prisma";

/** class1Id / class2Id must belong to business and correct FIHRIST kind */
export async function validateFihristClassIds(businessId, class1Id, class2Id) {
  let c1 = null;
  let c2 = null;
  if (class1Id) {
    const row = await prisma.business_masterdata_entry.findFirst({
      where: {
        id: class1Id,
        businessId,
        kind: "FIHRIST_1",
      },
      select: { id: true },
    });
    if (!row) return { error: "Sınıf 1 geçersiz." };
    c1 = row.id;
  }
  if (class2Id) {
    const row = await prisma.business_masterdata_entry.findFirst({
      where: {
        id: class2Id,
        businessId,
        kind: "FIHRIST_2",
      },
      select: { id: true },
    });
    if (!row) return { error: "Sınıf 2 geçersiz." };
    c2 = row.id;
  }
  return { class1Id: c1, class2Id: c2 };
}
