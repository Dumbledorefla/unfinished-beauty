import { useEffect, useState } from "react";
import { Users, ShoppingBag, Star, BookOpen, DollarSign, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";

interface DashboardStats {
  users: number;
  readings: number;
  products: number;
  orders: number;
  courses: number;
  taromantes: number;
  totalRevenue: number;
  monthRevenue: number;
  pendingPayments: number;
  todayConsultations: number;
  topProducts: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0, readings: 0, products: 0, orders: 0, courses: 0, taromantes: 0,
    totalRevenue: 0, monthRevenue: 0, pendingPayments: 0, todayConsultations: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [profilesRes, readingsRes, productsRes, ordersRes, coursesRes, taromantesRes, paidOrdersRes, monthOrdersRes, pendingRes, todayConsRes, topRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("tarot_readings").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("taromantes").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount").eq("status", "paid"),
      supabase.from("orders").select("total_amount").eq("status", "paid").gte("created_at", monthStart),
      supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending_payment", "payment_submitted"]),
      supabase.from("consultations").select("id", { count: "exact", head: true }).gte("scheduled_at", todayStart),
      supabase.from("order_items").select("product_name"),
    ]);

    const totalRevenue = (paidOrdersRes.data || []).reduce((s, o) => s + Number(o.total_amount), 0);
    const monthRevenue = (monthOrdersRes.data || []).reduce((s, o) => s + Number(o.total_amount), 0);

    // Count top products
    const productCounts: Record<string, number> = {};
    (topRes.data || []).forEach((item) => {
      productCounts[item.product_name] = (productCounts[item.product_name] || 0) + 1;
    });
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      users: profilesRes.count || 0,
      readings: readingsRes.count || 0,
      products: productsRes.count || 0,
      orders: ordersRes.count || 0,
      courses: coursesRes.count || 0,
      taromantes: taromantesRes.count || 0,
      totalRevenue,
      monthRevenue,
      pendingPayments: pendingRes.count || 0,
      todayConsultations: todayConsRes.count || 0,
      topProducts,
    });
    setLoading(false);
  };

  if (loading) return <p className="text-center text-foreground/50 py-8">Carregando dashboard...</p>;

  return (
    <div className="space-y-8">
      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={DollarSign} label="Receita Total" value={stats.totalRevenue} color="bg-emerald-500/20 text-emerald-400" prefix="R$" />
        <StatCard icon={TrendingUp} label="Receita do Mês" value={stats.monthRevenue} color="bg-primary/20 text-primary" prefix="R$" />
        <StatCard icon={Clock} label="Pagamentos Pendentes" value={stats.pendingPayments} color="bg-orange-500/20 text-orange-400" />
        <StatCard icon={Calendar} label="Consultas Hoje" value={stats.todayConsultations} color="bg-blue-500/20 text-blue-400" />
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={Users} label="Usuários" value={stats.users} color="bg-primary/20 text-primary" />
        <StatCard icon={Star} label="Leituras" value={stats.readings} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={ShoppingBag} label="Produtos" value={stats.products} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={ShoppingBag} label="Pedidos" value={stats.orders} color="bg-orange-500/20 text-orange-400" />
        <StatCard icon={BookOpen} label="Cursos" value={stats.courses} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Star} label="Taromantes" value={stats.taromantes} color="bg-pink-500/20 text-pink-400" />
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Produtos Mais Vendidos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-sm text-foreground">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{p.count} vendas</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
