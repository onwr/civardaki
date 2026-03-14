const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.business.updateMany({
    data: {
      primaryCategoryId: null,
    },
  });

  await prisma.businesscategory.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Kategori ilişkileri ve category tablosu temizlendi.");
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });