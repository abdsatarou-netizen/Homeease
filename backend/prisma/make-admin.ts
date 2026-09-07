import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage : npm run make-admin -- votre@email.com');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Aucun utilisateur trouvé avec l'email ${email}. Créez d'abord votre compte via l'application.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: Role.SUPER_ADMIN } });
  console.log(`✔ ${email} est maintenant SUPER_ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
