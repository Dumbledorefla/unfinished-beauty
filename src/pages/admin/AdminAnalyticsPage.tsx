import { useEffect, useState } from "react";
import { Eye, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalReadings: number;
  totalUsers: number;
  readingsToday: number;
  readingsThisWeek: number;
  readingsThisMonth: number;
  readingsByPage: { name: string; count: number }[];
  readingsByDay: { date: string; count: number }[];
  newUsersThisWeek: number;
  avgReadingsPerUser: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    const daysAgo = parseInt(period);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalReadingsRes, totalUsersRes, readingsTodayRes, readingsWeekRes,
      readingsMonthRes, readingsByTypeRes, readingsByDayRes, newUsersRes,
    ] = await Promise.all([
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }).gte("created_at", startDate),
      supabase.from("tarot_readings").select("reading_type").gte("created_at", startDate),
      supabase.from("tarot_readings").select("created_at").gte("created_at", startDate).order("created_at"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    ]);

    // Group by reading type
    const typeCounts: Record<string, number> = {};
    (readingsByTypeRes.data || []).forEach((r) => {
      const type = r.reading_type || "Tarot do Dia";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const readingsByPage = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Group by day
    const dayCounts: Record<string, number> = {};
    (readingsByDayRes.data || []).forEach((r) => {
      const day = new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const readingsByDay = Object.entries(dayCounts).map(([date, count]) => ({ date, count }));

    const totalUsers = totalUsersRes.count || 1;
    const totalReadings = totalReadingsRes.count || 0;

    setData({
      totalReadings,
      totalUsers: totalUsersRes.count || 0,
      readingsToday: readingsTodayRes.count || 0,
      readingsThisWeek: readingsWeekRes.count || 0,
      readingsThisMonth: readingsMonthRes.count || 0,
      readingsByPage,
      readingsByDay,
      newUsersThisWeek: newUsersRes.count || 0,
      avgReadingsPerUser: Math.round((totalReadings / totalUsers) * 10) / 10,
    });
    setLoading(false);
  };

  if (loading) return <p className="text-center text-slate-400 py-8">Carregando analytics...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Analytics</h2>
        <div className="flex gap-2">
          {(["7", "30", "90"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p
                  ? "bg-amber-500/15 text-amber-400 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Total de Leituras</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.totalReadings}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/15">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Usuários Registrados</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.totalUsers}</p>
                <p className="text-xs text-emerald-400 mt-0.5">+{data.newUsersThisWeek} esta semana</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/15">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Leituras Hoje</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.readingsToday}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/15">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Média por Usuário</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.avgReadingsPerUser}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-violet-500/15">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readings by day */}
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Leituras por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {data.readingsByDay.length > 0 ? (
            <div className="space-y-2">
              {data.readingsByDay.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-12">{day.date}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{
                        width: `${Math.max(
                          (day.count / Math.max(...data.readingsByDay.map((d) => d.count))) * 100,
                          5
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-8 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Sem dados ainda</h3>
              <p className="text-xs text-slate-500">Nenhuma leitura no período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services + Summary */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Serviços Mais Usados</CardTitle>
          </CardHeader>
          <CardContent>
            {data.readingsByPage.length > 0 ? (
              <div className="space-y-3">
                {data.readingsByPage.map((page, i) => (
                  <div key={page.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-200">{page.name}</span>
                    <span className="text-sm font-medium text-slate-400">{page.count} leituras</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhuma leitura registrada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Leituras esta semana</span>
                <span className="text-sm font-bold text-slate-100">{data.readingsThisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Leituras no período</span>
                <span className="text-sm font-bold text-slate-100">{data.readingsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Novos usuários (7 dias)</span>
                <span className="text-sm font-bold text-slate-100">{data.newUsersThisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Média leituras/usuário</span>
                <span className="text-sm font-bold text-slate-100">{data.avgReadingsPerUser}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about traffic analytics */}
      <Card className="bg-slate-900 border border-amber-500/20 rounded-xl">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 mt-0.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Analytics de Tráfego (Visitas, Dispositivos, Fontes)</h3>
              <p className="text-sm text-slate-400">
                Para métricas completas de tráfego web (visitas, visitantes únicos, dispositivos, fontes de tráfego,
                tempo na página), conecte o <strong className="text-amber-400">Google Analytics</strong> na aba
                <strong className="text-amber-400"> Integrações → Templates → Google Analytics</strong>.
                Os dados serão exibidos aqui automaticamente após a conexão.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
