import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Forge database...");

  const dealership = await db.dealership.upsert({
    where: { slug: "milwaukee-hd" },
    update: {},
    create: {
      name: "Milwaukee Harley-Davidson",
      slug: "milwaukee-hd",
      vertical: "POWERSPORTS",
      timezone: "America/Chicago",
      address: "1000 W Canal St",
      city: "Milwaukee",
      state: "WI",
      zip: "53233",
      phone: "(414) 555-0100",
    },
  });

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash("forge123!", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@forge.app" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "admin@forge.app",
      emailVerified: true,
      role: "ADMIN",
      dealershipId: dealership.id,
      phone: "(414) 555-0101",
      title: "Sales Manager",
      qrSlug: "alex-rivera",
      accounts: {
        create: {
          accountId: "admin@forge.app",
          providerId: "credential",
          password: passwordHash,
        },
      },
      userStats: { create: { xp: 2500, level: 5, dailyStreak: 12, followUpStreak: 8 } },
    },
  });

  const salesperson = await db.user.upsert({
    where: { email: "sales@forge.app" },
    update: {},
    create: {
      name: "Jordan Smith",
      email: "sales@forge.app",
      emailVerified: true,
      role: "SALESPERSON",
      dealershipId: dealership.id,
      phone: "(414) 555-0102",
      title: "Senior Sales Consultant",
      qrSlug: "jordan-smith",
      accounts: {
        create: {
          accountId: "sales@forge.app",
          providerId: "credential",
          password: passwordHash,
        },
      },
      userStats: { create: { xp: 1800, level: 4, dailyStreak: 5, closingStreak: 3 } },
    },
  });

  const tags = await Promise.all([
    db.tag.upsert({
      where: { dealershipId_name: { dealershipId: dealership.id, name: "Hot Lead" } },
      update: {},
      create: { dealershipId: dealership.id, name: "Hot Lead", color: "#f97316" },
    }),
    db.tag.upsert({
      where: { dealershipId_name: { dealershipId: dealership.id, name: "VIP" } },
      update: {},
      create: { dealershipId: dealership.id, name: "VIP", color: "#eab308" },
    }),
    db.tag.upsert({
      where: { dealershipId_name: { dealershipId: dealership.id, name: "Trade-In" } },
      update: {},
      create: { dealershipId: dealership.id, name: "Trade-In", color: "#3b82f6" },
    }),
  ]);

  const mike = await db.customer.upsert({
    where: { id: "seed-customer-mike" },
    update: {},
    create: {
      id: "seed-customer-mike",
      dealershipId: dealership.id,
      assignedToId: salesperson.id,
      firstName: "Mike",
      lastName: "Anderson",
      email: "mike.anderson@email.com",
      phone: "4145550200",
      address: "4521 Lake Drive",
      city: "Milwaukee",
      state: "WI",
      birthday: new Date("1985-06-15"),
      currentBike: "2019 Road King",
      dreamBike: "Road Glide ST in White Onyx Pearl",
      spouseName: "Sarah",
      kidsInfo: "2 kids",
      isVeteran: true,
      militaryStatus: "Army Veteran",
      occupation: "Construction Manager",
      favoriteLocations: "Sturgis, Door County",
      referralSource: "Bike Night Event",
      creditConcerns: "monthly payment",
      valueScore: 85,
      relationshipScore: 78,
      tradeInfo: { bike: "2021 Street Glide Special", mileage: 8500, condition: "good" },
      tags: { create: [{ tagId: tags[0].id }, { tagId: tags[2].id }] },
    },
  });

  await db.customerAiInsight.upsert({
    where: { customerId: mike.id },
    update: {},
    create: {
      customerId: mike.id,
      conversationSummary:
        "Mike is a serious buyer interested in upgrading to a Road Glide ST. Wife Sarah is involved and concerned about monthly payment staying under $550. Has a 2021 Street Glide Special to trade. Planning Sturgis trip in August.",
      buyingSignals: [
        "Specific model and color preference",
        "Trade-in ready",
        "Event attendee — Bike Night",
        "Returned for follow-up",
      ],
      riskFactors: ["Payment sensitivity", "Joint decision with spouse"],
      likelyObjections: ["Monthly payment too high", "Trade value expectations"],
      favoriteTopics: ["Road Glide ST", "Sturgis", "Touring accessories"],
      suggestedOpener: "How's the Sturgis planning going?",
      recommendedFollowUp: "Schedule demo ride with updated financing under $550/month",
      budgetTarget: "under $550/month",
      closeProbability: 0.72,
    },
  });

  const customers = [
    { firstName: "Lisa", lastName: "Chen", email: "lisa.chen@email.com", phone: "4145550201", dreamBike: "Sportster S", valueScore: 65, assignedToId: salesperson.id },
    { firstName: "Tom", lastName: "Williams", email: "tom.w@email.com", phone: "4145550202", dreamBike: "Pan America 1250", valueScore: 55, assignedToId: salesperson.id },
    { firstName: "Rachel", lastName: "Martinez", email: "rachel.m@email.com", phone: "4145550203", dreamBike: "Low Rider ST", valueScore: 90, assignedToId: admin.id },
    { firstName: "Dave", lastName: "Thompson", email: "dave.t@email.com", phone: "4145550204", currentBike: "2017 Softail", valueScore: 45, assignedToId: salesperson.id },
  ];

  for (const c of customers) {
    const existing = await db.customer.findFirst({
      where: { email: c.email, dealershipId: dealership.id },
    });
    if (!existing) {
      await db.customer.create({ data: { dealershipId: dealership.id, ...c } });
    }
  }

  const inventoryData = [
    { year: 2025, make: "Harley-Davidson", model: "Road Glide ST", trim: "Special", color: "White Onyx Pearl", price: 32999, mileage: 0, engine: "Milwaukee-Eight 117", hasAbs: true, hasNavigation: true, hasCruise: true, hasTourPack: true, stockNumber: "HD25001" },
    { year: 2025, make: "Harley-Davidson", model: "Street Glide ST", trim: "Special", color: "Vivid Black", price: 31999, mileage: 0, engine: "Milwaukee-Eight 117", hasAbs: true, hasNavigation: true, hasCruise: true, hasTourPack: true, stockNumber: "HD25002" },
    { year: 2024, make: "Harley-Davidson", model: "Road Glide ST", trim: "Special", color: "Billiard Red", price: 28999, mileage: 1200, engine: "Milwaukee-Eight 117", hasAbs: true, hasNavigation: true, hasCruise: true, stockNumber: "HD24003" },
    { year: 2025, make: "Harley-Davidson", model: "Sportster S", color: "Mineral Green", price: 15999, mileage: 0, engine: "Revolution Max 1250", hasAbs: true, stockNumber: "HD25004" },
    { year: 2025, make: "Harley-Davidson", model: "Low Rider ST", color: "Vivid Black", price: 24999, mileage: 0, engine: "Milwaukee-Eight 117", hasAbs: true, hasCruise: true, stockNumber: "HD25005" },
    { year: 2024, make: "Harley-Davidson", model: "Pan America 1250", color: "Gauntlet Gray", price: 19999, mileage: 3500, engine: "Revolution Max 1250", hasAbs: true, hasNavigation: true, stockNumber: "HD24006" },
  ];

  const inventory = [];
  for (const item of inventoryData) {
    const existing = await db.inventoryUnit.findFirst({
      where: { stockNumber: item.stockNumber, dealershipId: dealership.id },
    });
    if (existing) {
      inventory.push(existing);
    } else {
      const unit = await db.inventoryUnit.create({
        data: { dealershipId: dealership.id, ...item, status: "AVAILABLE" },
      });
      inventory.push(unit);
    }
  }

  const existingDeal = await db.deal.findFirst({
    where: { customerId: mike.id, title: "Mike Anderson — Road Glide ST" },
  });
  if (!existingDeal) {
    await db.deal.create({
      data: {
        dealershipId: dealership.id,
        customerId: mike.id,
        assignedToId: salesperson.id,
        inventoryUnitId: inventory[0].id,
        stage: "FINANCING",
        title: "Mike Anderson — Road Glide ST",
        amount: 32999,
        monthlyTarget: 550,
        closeProbability: 0.72,
      },
    });
  }

  const fortyTwoDaysAgo = new Date();
  fortyTwoDaysAgo.setDate(fortyTwoDaysAgo.getDate() - 42);

  const interactionCount = await db.interaction.count({ where: { customerId: mike.id } });
  if (interactionCount === 0) {
    await db.interaction.createMany({
      data: [
        { customerId: mike.id, userId: salesperson.id, type: "WALK_IN", title: "Bike Night", description: "Met at Bike Night event. Very interested in Road Glide ST.", occurredAt: fortyTwoDaysAgo },
        { customerId: mike.id, userId: salesperson.id, type: "DEMO_RIDE", title: "Demo Ride", description: "Took Road Glide ST for a spin. Loved the handling.", occurredAt: new Date(fortyTwoDaysAgo.getTime() + 7 * 86400000) },
        { customerId: mike.id, userId: salesperson.id, type: "PHONE", title: "Follow-up Call", description: "Discussed financing. Sarah concerned about payment.", occurredAt: new Date(fortyTwoDaysAgo.getTime() + 14 * 86400000) },
        { customerId: mike.id, userId: salesperson.id, type: "TEXT", title: "Text Follow-up", description: "Sent updated financing numbers.", occurredAt: new Date(fortyTwoDaysAgo.getTime() + 21 * 86400000) },
      ],
    });
  }

  const achievements = [
    { key: "first_sale", name: "First Sale", description: "Close your first deal", icon: "trophy", xpReward: 100 },
    { key: "follow_up_streak_7", name: "Follow-Up Pro", description: "7-day follow-up streak", icon: "flame", xpReward: 200 },
    { key: "ten_customers", name: "People Person", description: "Add 10 customers", icon: "users", xpReward: 150 },
  ];

  for (const a of achievements) {
    await db.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }

  console.log("Seed complete!");
  console.log("Login: sales@forge.app / forge123!");
  console.log("Admin: admin@forge.app / forge123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
