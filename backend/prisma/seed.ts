import { PrismaClient, Role, TransactionType, PropertyStatus } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'maison', name: 'Maisons', icon: '🏠', sortOrder: 1 },
  { slug: 'appartement', name: 'Appartements', icon: '🏢', sortOrder: 2 },
  { slug: 'chambre', name: 'Chambres', icon: '🛏️', sortOrder: 3 },
  { slug: 'parcelle', name: 'Parcelles / Terrains', icon: '🌳', sortOrder: 4 },
  { slug: 'bureau', name: 'Bureaux', icon: '🏢', sortOrder: 5 },
  { slug: 'local-commercial', name: 'Locaux commerciaux', icon: '🏪', sortOrder: 6 },
  { slug: 'voiture', name: 'Voitures', icon: '🚗', sortOrder: 7 },
  { slug: 'meuble', name: 'Meubles', icon: '🛋️', sortOrder: 8 },
  { slug: 'tourisme', name: 'Tourisme', icon: '🌴', sortOrder: 9 },
];

// Zones de démonstration citées dans le cahier des charges
const DEMO_AREAS = [
  { city: 'Cotonou', commune: 'Cotonou', quarter: 'Fidjrossè' },
  { city: 'Abomey-Calavi', commune: 'Abomey-Calavi', quarter: 'Godomey' },
  { city: 'Abomey-Calavi', commune: 'Abomey-Calavi', quarter: 'Zogbadjè' },
  { city: 'Abomey-Calavi', commune: 'Abomey-Calavi', quarter: 'Tankpè' },
  { city: 'Abomey-Calavi', commune: 'Abomey-Calavi', quarter: 'Akassato' },
  { city: 'Porto-Novo', commune: 'Porto-Novo', quarter: 'Centre-ville' },
  { city: 'Sèmè-Podji', commune: 'Sèmè-Podji', quarter: 'Centre' },
];

async function main() {
  console.log('Seed HomeEase — démarrage...');

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat });
  }

  const demoOwner = await prisma.user.upsert({
    where: { phone: '+22900000001' },
    update: {},
    create: {
      phone: '+22900000001',
      role: Role.OWNER,
      isPhoneVerified: true,
      isProVerified: true,
      profile: { create: { firstName: 'Kassoum', lastName: 'A. (Démo)', city: 'Abomey-Calavi' } },
    },
  });

  await prisma.user.upsert({
    where: { phone: '+22900000002' },
    update: {},
    create: {
      phone: '+22900000002',
      role: Role.ADMIN,
      isPhoneVerified: true,
      profile: { create: { firstName: 'Admin', lastName: 'HomeEase' } },
    },
  });

  const chambreCategory = await prisma.category.findUnique({ where: { slug: 'chambre' } });
  const appartCategory = await prisma.category.findUnique({ where: { slug: 'appartement' } });

  const demoListings = [
    { title: 'Chambre moderne à louer', price: 45000, categoryId: chambreCategory!.id, area: DEMO_AREAS[1] },
    { title: 'Chambre meublée', price: 35000, categoryId: chambreCategory!.id, area: DEMO_AREAS[2] },
    { title: 'Studio personnel', price: 60000, categoryId: chambreCategory!.id, area: DEMO_AREAS[3] },
    { title: 'Appartement moderne 2 chambres', price: 150000, categoryId: appartCategory!.id, area: DEMO_AREAS[1] },
  ];

  for (const listing of demoListings) {
    await prisma.property.create({
      data: {
        ownerId: demoOwner.id,
        categoryId: listing.categoryId,
        title: `${listing.title} [DÉMONSTRATION]`,
        description:
          'Annonce de démonstration générée automatiquement pour présenter HomeEase. ' +
          'Chambre propre et moderne, douche interne, cuisine commune, accès Wi-Fi.',
        transactionType: TransactionType.RENT,
        price: listing.price,
        bedrooms: 1,
        rooms: 2,
        hasInternalShower: true,
        hasWifi: true,
        hasParking: true,
        isFurnished: true,
        isVerified: true,
        isDemo: true,
        status: PropertyStatus.PUBLISHED,
        location: { create: listing.area },
        images: {
          create: [{ url: 'https://placehold.co/800x600?text=HomeEase+Demo', sortOrder: 0 }],
        },
      },
    });
  }

  await prisma.setting.upsert({
    where: { key: 'commission_percent' },
    update: {},
    create: { key: 'commission_percent', value: '5' },
  });
  await prisma.setting.upsert({
    where: { key: 'booking_fee_percent' },
    update: {},
    create: { key: 'booking_fee_percent', value: '0' },
  });

  console.log('Seed terminé : catégories + annonces de démonstration créées.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
