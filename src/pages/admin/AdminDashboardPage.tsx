import { useEffect, useState } from "react";
import {
  DollarSign, Users, Star, ShoppingBag, TrendingUp,
  ArrowUpRight, ArrowDownRight, Calendar, FileText, Package, Mail, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, changeType, icon: Icon, color }: MetricCardProps) {
  return (
    <Card className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {changeType === "up" ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : changeType === "down" ? (
                <ArrowDownRight className="w-3 h-3 text-red-400" />
              ) : null}
              <span className={`text-xs ${
                changeType === "up" ? "text-emerald-400" :
                changeType === "down" ? "text-red-400" : "text-slate-500"
              }`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const SERVICE_COLORS = ["#f59e0b", "#64748b", "#ec4899", "#6366f1", "#14b8a6", "#8b5cf6", "#ef4444"];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#e2e8f0",
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [stats, setStats] = useState({
    totalRevenue: 0, monthRevenue: 0, users: 0, readings: 0,
    pendingPayments: 0, todayConsultations: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ name: string; leituras: number }[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [profilesRes, readingsRes, paidRes, monthRes, pendingRes, todayRes, readingsByTypeRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount").eq("status", "paid"),
      supabase.from("orders").select("total_amount").eq("status", "paid").gte("created_at", monthStart),
      supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending_payment", "payment_submitted"]),
      supabase.from("consultations").select("id", { count: "exact", head: true }).gte("scheduled_at", todayStart),
      supabase.from("tarot_readings").select("reading_type"),
    ]);

    const totalRevenue = (paidRes.data || []).reduce((s, o) => s + Number(o.total_amount), 0);
    const monthRevenue = (monthRes.data || []).reduce((s, o) => s + Number(o.total_amount), 0);

    // Real service distribution
    const typeCounts: Record<string, number> = {};
    (readingsByTypeRes.data || []).forEach((r) => {
      const type = r.reading_type || "Tarot do Dia";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const totalReadingsCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);
    const distribution = Object.entries(typeCounts)
      .map(([name, count], i) => ({
        name,
        value: totalReadingsCount > 0 ? Math.round((count / totalReadingsCount) * 100) : 0,
        color: SERVICE_COLORS[i % SERVICE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
    setServiceDistribution(distribution);

    // Build monthly readings chart
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentMonth = now.getMonth();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      const y = currentMonth - i < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const start = new Date(y, m, 1).toISOString();
      const end = new Date(y, m + 1, 1).toISOString();
      const { count } = await supabase.from("tarot_readings").select("id", { count: "exact", head: true }).gte("created_at", start).lt("created_at", end);
      chartData.push({ name: months[m], leituras: count || 0 });
    }

    setMonthlyData(chartData);
    setStats({
      totalRevenue,
      monthRevenue,
      users: profilesRes.count || 0,
      readings: readingsRes.count || 0,
      pendingPayments: pendingRes.count || 0,
      todayConsultations: todayRes.count || 0,
    });
    setLoading(false);
  };

  if (loading) return <p className="text-center text-slate-400 py-8">Carregando dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
            className={period === p
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200"
            }
          >
            {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
          </Button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={`R$ ${stats.totalRevenue.toFixed(2)}`} change={stats.totalRevenue > 0 ? "Vendas ativas" : "Sem dados anteriores"} changeType={stats.totalRevenue > 0 ? "up" : "neutral"} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <MetricCard title="Leituras Realizadas" value={String(stats.readings)} change={`${stats.readings} total`} changeType={stats.readings > 0 ? "up" : "neutral"} icon={Star} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        <MetricCard title="Usuários Ativos" value={String(stats.users)} change={`${stats.users} registrados`} changeType={stats.users > 0 ? "up" : "neutral"} icon={Users} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <MetricCard title="Consultas Hoje" value={String(stats.todayConsultations)} change={`${stats.pendingPayments} pagamentos pendentes`} changeType="neutral" icon={Calendar} color="bg-gradient-to-br from-violet-500 to-violet-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Leituras por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorLeituras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="leituras" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLeituras)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {serviceDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-slate-200">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <h3 className="text-sm font-medium text-slate-400 mb-1">Sem dados ainda</h3>
                <p className="text-xs text-slate-500">Realize leituras para ver a distribuição</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Novo Artigo", icon: FileText, href: "/admin/blog" },
              { label: "Novo Produto", icon: Package, href: "/admin/produtos" },
              { label: "Ver Pedidos", icon: ShoppingBag, href: "/admin/pedidos" },
              { label: "Enviar Newsletter", icon: Mail, href: "/admin/newsletter" },
            ].map((action) => (
              <Link key={action.label} to={action.href}>
                <Button variant="outline" className="w-full justify-start gap-2 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200">
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: `${stats.users} usuários registrados`, icon: Users },
                { text: `${stats.readings} leituras realizadas`, icon: Star },
                { text: `R$ ${stats.monthRevenue.toFixed(2)} receita do mês`, icon: TrendingUp },
                { text: `${stats.pendingPayments} pagamentos pendentes`, icon: Calendar },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-slate-800/50">
                  <item.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
