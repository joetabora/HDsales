import db from "@/lib/db";
import type { Prisma, TaskStatus } from "@prisma/client";

export async function listTasks(dealershipId: string, filters?: {
  assignedToId?: string;
  status?: TaskStatus;
  customerId?: string;
}) {
  return db.task.findMany({
    where: {
      dealershipId,
      deletedAt: null,
      ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      assignedTo: { select: { id: true, name: true, image: true } },
    },
    orderBy: [{ dueAt: "asc" }, { priority: "desc" }],
  });
}

export async function createTask(data: {
  dealershipId: string;
  title: string;
  description?: string;
  customerId?: string;
  assignedToId?: string;
  createdById?: string;
  dueAt?: Date;
  priority?: Prisma.TaskCreateInput["priority"];
}) {
  return db.task.create({ data });
}

export async function completeTask(taskId: string, dealershipId: string) {
  return db.task.update({
    where: { id: taskId, dealershipId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

export async function getDashboardData(dealershipId: string, userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayFollowUps,
    appointments,
    birthdays,
    hotProspects,
    pendingDeals,
    recentActivity,
    tasks,
    soldThisMonth,
    totalCustomers,
    revenueAgg,
  ] = await Promise.all([
    db.task.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueAt: { gte: today, lt: tomorrow },
      },
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      take: 10,
    }),
    db.appointment.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        startsAt: { gte: today, lt: tomorrow },
      },
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      take: 10,
    }),
    db.customer.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        birthday: { not: null },
      },
      take: 20,
    }),
    db.customer.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        valueScore: { gte: 70 },
      },
      orderBy: { valueScore: "desc" },
      take: 5,
    }),
    db.deal.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        stage: { in: ["NEGOTIATING", "FINANCING", "WAITING"] },
      },
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      take: 10,
    }),
    db.interaction.findMany({
      where: { customer: { dealershipId } },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 15,
    }),
    db.task.findMany({
      where: {
        dealershipId,
        assignedToId: userId,
        deletedAt: null,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      orderBy: { dueAt: "asc" },
      take: 10,
    }),
    db.deal.count({
      where: {
        dealershipId,
        stage: "SOLD",
        closedAt: { gte: monthStart },
      },
    }),
    db.customer.count({ where: { dealershipId, deletedAt: null } }),
    db.deal.aggregate({
      where: {
        dealershipId,
        stage: "SOLD",
        closedAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.amount ?? 0);
  const closingRatio = totalCustomers > 0 ? (soldThisMonth / totalCustomers) * 100 : 0;

  return {
    todayFollowUps,
    appointments,
    birthdays: birthdays.filter((c) => {
      if (!c.birthday) return false;
      return (
        c.birthday.getMonth() === today.getMonth() &&
        c.birthday.getDate() === today.getDate()
      );
    }),
    hotProspects,
    pendingDeals,
    recentActivity,
    tasks,
    metrics: {
      closingRatio: Math.round(closingRatio * 10) / 10,
      soldThisMonth,
      totalCustomers,
      revenue,
    },
  };
}
