import { BookOpen } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { KnowledgeSearch } from "@/features/knowledge/components/knowledge-search";

export default async function KnowledgePage() {
  const dealershipId = await getDealershipId();

  const articles = await db.knowledgeArticle.findMany({
    where: { dealershipId, deletedAt: null, isPublished: true },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: { id: true, title: true, slug: true, category: true, content: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-forge-accent" />
          Knowledge Base
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          {articles.length} article{articles.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <KnowledgeSearch initialArticles={articles} />
    </div>
  );
}
