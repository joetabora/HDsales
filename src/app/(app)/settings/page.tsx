import { Settings } from "lucide-react";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { StatsBar } from "@/features/gamification/components/stats-bar";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const dealershipId = await getDealershipId();

  const [dbUser, dealership, userStats, achievements] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, title: true, bio: true, qrSlug: true },
    }),
    db.dealership.findUnique({
      where: { id: dealershipId },
      select: { id: true, name: true, phone: true, address: true, city: true, state: true, timezone: true },
    }),
    db.userStats.findUnique({ where: { userId: user.id } }),
    db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  if (!dbUser || !dealership) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-forge-accent" />
          Settings
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Manage your profile and dealership preferences
        </p>
      </div>

      {userStats && (
        <StatsBar
          stats={{
            xp: userStats.xp,
            level: userStats.level,
            dailyStreak: userStats.dailyStreak,
            followUpStreak: userStats.followUpStreak,
            closingStreak: userStats.closingStreak,
            totalDeals: userStats.totalDeals,
            totalRevenue: Number(userStats.totalRevenue),
          }}
          achievements={achievements.map((a) => ({
            id: a.id,
            name: a.achievement.name,
            description: a.achievement.description,
            icon: a.achievement.icon,
            earnedAt: a.earnedAt.toISOString(),
          }))}
        />
      )}

      <SettingsForm user={dbUser} dealership={dealership} />
    </div>
  );
}
