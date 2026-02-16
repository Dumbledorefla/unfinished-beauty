import { useState } from "react";
import {
  Globe, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const seoPages = [
  { path: "/", title: "Página Inicial", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/tarot/dia", title: "Tarot do Dia", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/tarot/amor", title: "Tarot do Amor", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/tarot/completo", title: "Tarot Completo", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/horoscopo", title: "Horóscopo", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/numerologia", title: "Numerologia", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/mapa-astral", title: "Mapa Astral", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/signos", title: "Signos", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/compatibilidade", title: "Compatibilidade", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/calendario-lunar", title: "Calendário Lunar", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/blog", title: "Blog", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/consultas", title: "Consultas", hasMetaTags: true, hasH1: true, hasSchema: true, indexed: true },
  { path: "/cursos", title: "Cursos", hasMetaTags: true, hasH1: true, hasSchema: false, indexed: true },
  { path: "/produtos", title: "Produtos", hasMetaTags: true, hasH1: true, hasSchema: false, indexed: true },
];

export default function AdminSEOPage() {
  const [filter, setFilter] = useState<"all" | "issues" | "ok">("all");

  const filteredPages = seoPages.filter(page => {
    if (filter === "issues") return !page.hasMetaTags || !page.hasH1 || !page.hasSchema;
    if (filter === "ok") return page.hasMetaTags && page.hasH1 && page.hasSchema;
    return true;
  });

  const totalIssues = seoPages.filter(p => !p.hasMetaTags || !p.hasH1 || !p.hasSchema).length;
  const seoScore = Math.round(((seoPages.length - totalIssues) / seoPages.length) * 100);

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className={`text-4xl font-bold ${seoScore >= 70 ? "text-emerald-400" : seoScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
              {seoScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Score SEO Geral</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-4xl font-bold text-amber-400">{totalIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Páginas com Problemas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-4xl font-bold text-primary">{seoPages.filter(p => p.indexed).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Páginas Indexadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <Card className="bg-card/80 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground/80">Checklist SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "robots.txt configurado", ok: true },
              { label: "Sitemap XML acessível", ok: true },
              { label: "Preconnect para Google Fonts", ok: true },
              { label: "Canonical URLs configuradas", ok: true },
              { label: "OG Tags configuradas", ok: true },
              { label: "Páginas privadas com noindex", ok: true },
              { label: "Breadcrumbs com JSON-LD", ok: true },
              { label: "FAQPage Schema nas páginas principais", ok: true },
              { label: "Todas as páginas com meta tags", ok: totalIssues === 0 },
              { label: "Structured Data em todas as páginas", ok: totalIssues === 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span className={item.ok ? "text-muted-foreground" : "text-red-300/70"}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {[
          { id: "all" as const, label: `Todas (${seoPages.length})` },
          { id: "issues" as const, label: `Com problemas (${totalIssues})` },
          { id: "ok" as const, label: `OK (${seoPages.length - totalIssues})` },
        ].map((f) => (
          <Button key={f.id} variant={filter === f.id ? "default" : "outline"} size="sm" onClick={() => setFilter(f.id)}
            className={filter === f.id ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-primary/20"}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Pages table */}
      <Card className="bg-card/80 border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Página</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Meta Tags</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">H1</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Schema</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Indexada</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.path} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="p-3">
                      <div>
                        <p className="text-sm text-foreground">{page.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {page.hasMetaTags ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {page.hasH1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {page.hasSchema ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {page.indexed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
