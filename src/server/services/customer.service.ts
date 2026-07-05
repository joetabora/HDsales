import db from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface CustomerFilters {
  dealershipId: string;
  search?: string;
  assignedToId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

export async function listCustomers(filters: CustomerFilters) {
  const where: Prisma.CustomerWhereInput = {
    dealershipId: filters.dealershipId,
    deletedAt: null,
    ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
    ...(filters.tagId
      ? { tags: { some: { tagId: filters.tagId } } }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
            { phone: { contains: filters.search } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
        deals: { where: { deletedAt: null }, take: 1, orderBy: { updatedAt: "desc" } },
        _count: { select: { interactions: true, tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    }),
    db.customer.count({ where }),
  ]);

  return { customers, total };
}

export async function getCustomerById(id: string, dealershipId: string) {
  return db.customer.findFirst({
    where: { id, dealershipId, deletedAt: null },
    include: {
      assignedTo: { select: { id: true, name: true, image: true, email: true } },
      tags: { include: { tag: true } },
      deals: {
        where: { deletedAt: null },
        include: { inventoryUnit: true },
        orderBy: { updatedAt: "desc" },
      },
      tasks: {
        where: { deletedAt: null, status: { not: "COMPLETED" } },
        orderBy: { dueAt: "asc" },
        take: 10,
      },
    },
  });
}

export async function getCustomerTimeline(customerId: string, limit = 50) {
  return db.interaction.findMany({
    where: { customerId, deletedAt: null },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
}

export async function createCustomer(data: {
  dealershipId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dreamBike?: string;
  currentBike?: string;
  assignedToId?: string;
}) {
  const customer = await db.customer.create({
    data: {
      dealershipId: data.dealershipId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dreamBike: data.dreamBike,
      currentBike: data.currentBike,
      assignedToId: data.assignedToId,
    },
  });

  await db.interaction.create({
    data: {
      customerId: customer.id,
      type: "WALK_IN",
      title: "Customer created",
      description: "Added to Forge",
    },
  });

  return customer;
}

export async function updateCustomer(
  id: string,
  dealershipId: string,
  data: Prisma.CustomerUpdateInput
) {
  const existing = await db.customer.findFirst({
    where: { id, dealershipId, deletedAt: null },
  });
  if (!existing) throw new Error("Customer not found");
  return db.customer.update({ where: { id }, data });
}

export async function addInteraction(
  customerId: string,
  userId: string | undefined,
  data: {
    type: Prisma.InteractionCreateInput["type"];
    title: string;
    description?: string;
    metadata?: Prisma.InputJsonValue;
    occurredAt?: Date;
  }
) {
  const interaction = await db.interaction.create({
    data: {
      customerId,
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      metadata: data.metadata ?? {},
      occurredAt: data.occurredAt ?? new Date(),
    },
  });

  await db.customer.update({
    where: { id: customerId },
    data: { updatedAt: new Date() },
  });

  return interaction;
}

export async function addNote(
  customerId: string,
  userId: string | undefined,
  content: string
) {
  const note = await db.note.create({
    data: { customerId, userId, content },
  });

  await addInteraction(customerId, userId, {
    type: "NOTE",
    title: "Note added",
    description: content.slice(0, 200),
  });

  return note;
}

export async function globalSearch(dealershipId: string, query: string) {
  const q = query.trim();
  if (!q) return { customers: [], inventory: [], tasks: [] };

  const [customers, inventory, tasks] = await Promise.all([
    db.customer.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      take: 8,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dreamBike: true,
      },
    }),
    db.inventoryUnit.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        OR: [
          { vin: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
          { make: { contains: q, mode: "insensitive" } },
          { stockNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, year: true, make: true, model: true, color: true, price: true },
    }),
    db.task.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        title: { contains: q, mode: "insensitive" },
      },
      take: 5,
      select: { id: true, title: true, status: true, dueAt: true },
    }),
  ]);

  return { customers, inventory, tasks };
}
