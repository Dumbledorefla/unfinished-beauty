import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CheckStatus = "idle" | "running" | "ok" | "error" | "warn";

interface RouteCheck {
  path: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

interface TableCheck {
  table: string;
  status: CheckStatus;
  count?: number;
  detail?: string;
}

interface EdgeCheck {
  name: string;
  status: CheckStatus;
  detail?: string;
}

const ALL_ROUTES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/auth", label: "Auth" },
  { path: "/tarot/dia", label: "Tarot do Dia" },
  { path: "/tarot/amor", label: "Tarot do Amor" },
  { path: "/tarot/completo", label: "Tarot Completo" },
  { path: "/numerologia", label: "Numerologia" },
  { path: "/horoscopo", label: "Horóscopo" },
  { path: "/mapa-astral", label: "Mapa Astral" },
  { path: "/consultas", label: "Consultas" },
  { path: "/cursos", label: "Cursos" },
  { path: "/produtos", label: "Produtos" },
  { path: "/carrinho", label: "Carrinho" },
  { path: "/perfil", label: "Perfil" },
  { path: "/admin", label: "Admin" },
  { path: "/reset-password", label: "Reset Password" },
  { path: "/taromante-painel", label: "Painel Taromante" },
];

const ALL_TABLES = [
  "profiles", "tarot_readings", "products", "orders", "order_items",
  "courses", "course_enrollments", "taromantes", "consultations",
  "reviews", "user_roles", "site_settings", "google_calendar_tokens", "user_products",
];

const EDGE_FUNCTIONS = [
  "oracle-interpret",
  "send-email",
  "send-whatsapp",
  "notify-consultation",
  "send-consultation-reminders",
  "google-calendar-auth",
  "google-calendar-event",
];

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "running") return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  if (status === "ok") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === "error") return <XCircle className="w-4 h-4 text-destructive" />;
  if (status === "warn") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />;
}

export default function AdminDebug() {
  const [routes, setRoutes] = useState<RouteCheck[]>(
    ALL_ROUTES.map((r) => ({ ...r, status: "idle" as CheckStatus }))
  );
  const [tables, setTables] = useState<TableCheck[]>(
    ALL_TABLES.map((t) => ({ table: t, status: "idle" as CheckStatus }))
  );
  const [edges, setEdges] = useState<EdgeCheck[]>(
    EDGE_FUNCTIONS.map((e) => ({ name: e, status: "idle" as CheckStatus }))
  );
  const [running, setRunning] = useState(false);

  const runAllChecks = async () => {
    setRunning(true);

    // Reset all to running
    setRoutes((prev) => prev.map((r) => ({ ...r, status: "running" as CheckStatus, detail: undefined })));
    setTables((prev) => prev.map((t) => ({ ...t, status: "running" as CheckStatus, detail: undefined, count: undefined })));
    setEdges((prev) => prev.map((e) => ({ ...e, status: "running" as CheckStatus, detail: undefined })));

    // Check routes by fetching them
    const origin = window.location.origin;
    const routeResults = await Promise.all(
      ALL_ROUTES.map(async (r) => {
        try {
          const res = await fetch(`${origin}${r.path}`, { method: "HEAD", redirect: "follow" });
          if (res.ok) return { ...r, status: "ok" as CheckStatus, detail: `${res.status}` };
          return { ...r, status: "error" as CheckStatus, detail: `HTTP ${res.status}` };
        } catch (err: any) {
          return { ...r, status: "error" as CheckStatus, detail: err.message };
        }
      })
    );
    setRoutes(routeResults);

    // Check tables
    const tableResults = await Promise.all(
      ALL_TABLES.map(async (t) => {
        try {
          const { count, error } = await supabase.from(t as any).select("*", { count: "exact", head: true });
          if (error) return { table: t, status: "error" as CheckStatus, detail: error.message };
          return { table: t, status: "ok" as CheckStatus, count: count ?? 0 };
        } catch (err: any) {
          return { table: t, status: "error" as CheckStatus, detail: err.message };
        }
      })
    );
    setTables(tableResults);

    // Check edge functions (OPTIONS preflight)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const edgeResults = await Promise.all(
      EDGE_FUNCTIONS.map(async (name) => {
        try {
          const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
            method: "OPTIONS",
          });
          if (res.ok || res.status === 204) return { name, status: "ok" as CheckStatus, detail: "Reachable" };
          return { name, status: "warn" as CheckStatus, detail: `HTTP ${res.status}` };
        } catch (err: any) {
          return { name, status: "error" as CheckStatus, detail: err.message };
        }
      })
    );
    setEdges(edgeResults);

    setRunning(false);
  };

  const okCount = (items: { status: CheckStatus }[]) => items.filter((i) => i.status === "ok").length;
  const errCount = (items: { status: CheckStatus }[]) => items.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-foreground">Painel de Debug</h2>
          <p className="text-sm text-muted-foreground">Verificação rápida de rotas, tabelas e funções</p>
        </div>
        <Button onClick={runAllChecks} disabled={running} variant="outline" className="border-slate-700">
          <RefreshCw className={`w-4 h-4 mr-2 ${running ? "animate-spin" : ""}`} />
          {running ? "Verificando…" : "Executar Diagnóstico"}
        </Button>
      </div>

      {/* Summary */}
      {!running && routes.some((r) => r.status !== "idle") && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-900 border border-slate-800 rounded-xl">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Rotas</p>
              <p className="text-2xl font-bold text-slate-100">{okCount(routes)}/{routes.length}</p>
              {errCount(routes) > 0 && <Badge variant="destructive" className="mt-1">{errCount(routes)} erro(s)</Badge>}
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border border-slate-800 rounded-xl">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Tabelas</p>
              <p className="text-2xl font-bold text-slate-100">{okCount(tables)}/{tables.length}</p>
              {errCount(tables) > 0 && <Badge variant="destructive" className="mt-1">{errCount(tables)} erro(s)</Badge>}
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border border-slate-800 rounded-xl">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Edge Functions</p>
              <p className="text-2xl font-bold text-slate-100">{okCount(edges)}/{edges.length}</p>
              {errCount(edges) > 0 && <Badge variant="destructive" className="mt-1">{errCount(edges)} erro(s)</Badge>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Routes */}
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-serif font-bold text-foreground mb-3">🔗 Rotas ({routes.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routes.map((r) => (
              <div key={r.path} className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50 border border-border/50">
                <StatusIcon status={r.status} />
                <span className="text-sm font-mono text-foreground/80 flex-1">{r.path}</span>
                <span className="text-xs text-muted-foreground">{r.label}</span>
                {r.detail && r.status === "error" && (
                  <Badge variant="destructive" className="text-xs">{r.detail}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables */}
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-serif font-bold text-foreground mb-3">🗄️ Tabelas ({tables.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tables.map((t) => (
              <div key={t.table} className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50 border border-border/50">
                <StatusIcon status={t.status} />
                <span className="text-sm font-mono text-foreground/80 flex-1">{t.table}</span>
                {t.status === "ok" && <Badge variant="secondary" className="text-xs">{t.count} rows</Badge>}
                {t.detail && t.status === "error" && (
                  <Badge variant="destructive" className="text-xs truncate max-w-[150px]">{t.detail}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-serif font-bold text-foreground mb-3">⚡ Edge Functions ({edges.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {edges.map((e) => (
              <div key={e.name} className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50 border border-border/50">
                <StatusIcon status={e.status} />
                <span className="text-sm font-mono text-foreground/80 flex-1">{e.name}</span>
                {e.detail && <span className="text-xs text-muted-foreground">{e.detail}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
