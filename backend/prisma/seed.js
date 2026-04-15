const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("123456", 10);

  const owner1 = await prisma.user.create({
    data: {
      fullName: "Aizada Owner",
      email: "owner1@test.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      fullName: "Nuriza Owner",
      email: "owner2@test.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const salon1 = await prisma.salon.create({
    data: {
      name: "Pink Glow Studio",
      description: "Современный салон красоты с мягкой атмосферой и premium сервисом.",
      address: "Bishkek, Chuy 120",
      imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
      ownerId: owner1.id,
    },
  });

  const salon2 = await prisma.salon.create({
    data: {
      name: "Rose Beauty Bar",
      description: "Уютный beauty salon для волос, макияжа и ухода за лицом.",
      address: "Bishkek, Kievskaya 77",
      imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
      ownerId: owner2.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        name: "Haircut",
        description: "Женская стрижка",
        price: 20,
        durationMin: 60,
        salonId: salon1.id,
      },
      {
        name: "Hair Coloring",
        description: "Окрашивание волос",
        price: 45,
        durationMin: 120,
        salonId: salon1.id,
      },
      {
        name: "Manicure",
        description: "Маникюр с покрытием",
        price: 18,
        durationMin: 60,
        salonId: salon2.id,
      },
      {
        name: "Makeup",
        description: "Вечерний макияж",
        price: 30,
        durationMin: 90,
        salonId: salon2.id,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Hair Mask",
        description: "Питательная маска для волос",
        price: 12,
        stock: 15,
        salonId: salon1.id,
      },
      {
        name: "Face Serum",
        description: "Сыворотка для лица",
        price: 22,
        stock: 10,
        salonId: salon2.id,
      },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });