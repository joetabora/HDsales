import db from "@/lib/db";
import { addDays } from "date-fns";

export async function processFollowUpEnrollments() {
  const now = new Date();
  const dueEnrollments = await db.followUpEnrollment.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
    include: {
      sequence: { include: { steps: { orderBy: { order: "asc" } } } },
      customer: true,
    },
  });

  for (const enrollment of dueEnrollments) {
    const step = enrollment.sequence.steps[enrollment.currentStep];
    if (!step) {
      await db.followUpEnrollment.update({
        where: { id: enrollment.id },
        data: { isActive: false, completedAt: new Date() },
      });
      continue;
    }

    await db.task.create({
      data: {
        dealershipId: enrollment.customer.dealershipId,
        customerId: enrollment.customerId,
        title: step.title,
        description: step.template ?? undefined,
        dueAt: now,
        priority: "MEDIUM",
        metadata: { followUpStepId: step.id, sequenceId: enrollment.sequenceId },
      },
    });

    const nextStepIndex = enrollment.currentStep + 1;
    const nextStep = enrollment.sequence.steps[nextStepIndex];

    if (nextStep) {
      await db.followUpEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextStepIndex,
          nextRunAt: addDays(now, nextStep.delayDays),
        },
      });
    } else {
      await db.followUpEnrollment.update({
        where: { id: enrollment.id },
        data: { isActive: false, completedAt: new Date() },
      });
    }
  }
}

export async function enrollCustomerInSequence(
  customerId: string,
  sequenceId: string
) {
  const sequence = await db.followUpSequence.findUnique({
    where: { id: sequenceId },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  if (!sequence || sequence.steps.length === 0) {
    throw new Error("Sequence not found or has no steps");
  }

  const firstStep = sequence.steps[0];

  return db.followUpEnrollment.create({
    data: {
      customerId,
      sequenceId,
      currentStep: 0,
      nextRunAt: addDays(new Date(), firstStep.delayDays),
    },
  });
}

export async function listFollowUpSequences(dealershipId: string) {
  return db.followUpSequence.findMany({
    where: { dealershipId, isActive: true },
    include: { steps: { orderBy: { order: "asc" } }, _count: { select: { enrollments: true } } },
  });
}
