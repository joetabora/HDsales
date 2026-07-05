import { Flame, Star, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface UserStats {
  xp: number;
  level: number;
  dailyStreak: number;
  followUpStreak: number;
  closingStreak: number;
  totalDeals: number;
  totalRevenue: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  users: Star,
};

export function StatsBar({
  stats,
  achievements,
}: {
  stats: UserStats;
  achievements: Achievement[];
}) {
  const xpForNextLevel = stats.level * 500;
  const xpProgress = Math.min((stats.xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-forge-accent/20 via-forge-accent/10 to-transparent border-b border-forge-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-forge-accent" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-forge-accent">Level {stats.level}</p>
              <p className="text-xs text-forge-muted mt-1">{stats.xp.toLocaleString()} XP</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-xs text-forge-muted mb-1">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{Math.round(xpProgress)}%</span>
              </div>
              <Progress value={xpProgress} />
            </div>
          </div>
        </CardContent>
      </div>

      <CardContent className="pt-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="text-center rounded-lg border border-forge-border p-3">
            <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.dailyStreak}</p>
            <p className="text-[10px] text-forge-muted uppercase tracking-wider">Daily Streak</p>
          </div>
          <div className="text-center rounded-lg border border-forge-border p-3">
            <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.followUpStreak}</p>
            <p className="text-[10px] text-forge-muted uppercase tracking-wider">Follow-Up Streak</p>
          </div>
          <div className="text-center rounded-lg border border-forge-border p-3">
            <Trophy className="h-5 w-5 text-forge-accent mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.closingStreak}</p>
            <p className="text-[10px] text-forge-muted uppercase tracking-wider">Closing Streak</p>
          </div>
          <div className="text-center rounded-lg border border-forge-border p-3">
            <Star className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.totalDeals}</p>
            <p className="text-[10px] text-forge-muted uppercase tracking-wider">
              {formatCurrency(stats.totalRevenue)} revenue
            </p>
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-forge-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-forge-muted mb-3">
              Achievements
            </p>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => {
                const Icon = ICON_MAP[a.icon] ?? Trophy;
                return (
                  <Badge
                    key={a.id}
                    variant="default"
                    className="gap-1.5 py-1.5 px-3"
                    title={a.description}
                  >
                    <Icon className="h-3 w-3" />
                    {a.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
