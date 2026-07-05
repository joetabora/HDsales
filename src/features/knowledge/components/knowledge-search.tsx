"use client";

import { useState, useTransition } from "react";
import { BookOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
}

export function KnowledgeSearch({ initialArticles }: { initialArticles: KnowledgeArticle[] }) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState(initialArticles);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    startTransition(async () => {
      const params = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : "";
      const res = await fetch(`/api/knowledge${params}`);
      if (res.ok) {
        setArticles(await res.json());
      }
    });
  }

  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forge-muted" />
        <Input
          placeholder="Search knowledge base..."
          className="pl-9"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-forge-muted">
            Searching…
          </span>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="outline">{cat}</Badge>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="rounded-xl border border-forge-border bg-forge-surface/50 p-12 text-center">
          <BookOpen className="h-12 w-12 text-forge-muted mx-auto mb-3" />
          <p className="text-lg font-medium">No articles found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="cursor-pointer hover:border-forge-accent/30 transition-colors"
              onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
            >
              <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base">{article.title}</CardTitle>
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
              </CardHeader>
              {expandedId === article.id && (
                <CardContent className="pt-0 pb-4">
                  <p className="text-sm text-forge-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {article.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
