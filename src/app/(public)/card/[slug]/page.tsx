import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import db from "@/lib/db";
import { formatPhone } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessCardPage({ params }: CardPageProps) {
  const { slug } = await params;

  const user = await db.user.findFirst({
    where: { qrSlug: slug, isActive: true },
    include: {
      dealership: true,
    },
  });

  if (!user) notFound();

  const dealership = user.dealership;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-forge-background via-forge-background to-forge-accent/5">
      <Card className="w-full max-w-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-forge-accent/30 to-forge-accent/10 relative">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <Avatar className="h-20 w-20 border-4 border-forge-surface">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-14 pb-8 text-center space-y-4">
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            {user.title && (
              <p className="text-sm text-forge-muted-foreground mt-0.5">{user.title}</p>
            )}
            <Badge variant="default" className="mt-2">
              <Sparkles className="h-3 w-3 mr-1" />
              {dealership.name}
            </Badge>
          </div>

          {user.bio && (
            <p className="text-sm text-forge-muted-foreground leading-relaxed px-2">{user.bio}</p>
          )}

          <div className="space-y-3 text-sm text-left px-4">
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="flex items-center gap-3 rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
              >
                <Phone className="h-4 w-4 text-forge-accent shrink-0" />
                <span>{formatPhone(user.phone)}</span>
              </a>
            )}
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-3 rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
            >
              <Mail className="h-4 w-4 text-forge-accent shrink-0" />
              <span className="truncate">{user.email}</span>
            </a>
            {dealership.address && (
              <div className="flex items-start gap-3 rounded-lg border border-forge-border p-3">
                <MapPin className="h-4 w-4 text-forge-accent shrink-0 mt-0.5" />
                <span>
                  {dealership.address}
                  {dealership.city && `, ${dealership.city}`}
                  {dealership.state && `, ${dealership.state}`}
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-forge-muted pt-2">
            Powered by Forge Sales OS
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
