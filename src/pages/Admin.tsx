import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShoppingBag, Star, Calendar,
  BookOpen, Settings, Shield, Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "@/components/admin/StatCard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminTaromantes from "@/components/admin/AdminTaromantes";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminConsultations from "@/components/admin/AdminConsultations";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminDebug from "@/components/admin/AdminDebug";

export default function Admin() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ users: 0, readings: 0, products: 0, orders: 0, courses: 0, taromantes: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [taromantes, setTaromantes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
    if (!isLoading && isAuthenticated && !isAdmin) navigate("/");
  }, [isLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (isAdmin && !dataLoaded) { loadData(); setDataLoaded(true); }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [profilesRes, readingsRes, productsRes, ordersRes, coursesRes, taromantesRes, consultationsRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("tarot_readings").select("id", { count: "exact", head: true }),
        supabase.from("products").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("courses").select("*"),
        supabase.from("taromantes").select("*"),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*"),
      ]);
      setUsers(profilesRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setCourses(coursesRes.data || []);
      setTaromantes(taromantesRes.data || []);
      setConsultations(consultationsRes.data || []);
      setSiteSettings(settingsRes.data || []);
      setStats({
        users: profilesRes.data?.length || 0,
        readings: readingsRes.count || 0,
        products: productsRes.data?.length || 0,
        orders: ordersRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
        taromantes: taromantesRes.data?.length || 0,
      });
    } catch (err) { console.error("Admin loadData error:", err); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando...</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center text-foreground">
      <Card className="bg-card/80 border-destructive/30 max-w-md">
        <CardContent className="pt-6 text-center">
          <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-foreground/60 mb-4">Você não tem permissão de administrador.</p>
          <Button onClick={() => navigate("/")} variant="outline">Voltar ao Início</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-primary/20 bg-card/50 backdrop-blur-md px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold gold-text flex items-center gap-2"><Shield className="w-5 h-5" /> Painel Admin</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-primary/30">Voltar ao Site</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-card/80 border border-primary/20 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Usuários</TabsTrigger>
            <TabsTrigger value="products"><ShoppingBag className="w-4 h-4 mr-1" />Produtos</TabsTrigger>
            <TabsTrigger value="taromantes"><Star className="w-4 h-4 mr-1" />Taromantes</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-1" />Pedidos</TabsTrigger>
            <TabsTrigger value="consultations"><Calendar className="w-4 h-4 mr-1" />Consultas</TabsTrigger>
            <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-1" />Cursos</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Config</TabsTrigger>
            <TabsTrigger value="debug"><Bug className="w-4 h-4 mr-1" />Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Users} label="Usuários" value={stats.users} color="bg-primary/20 text-primary" />
              <StatCard icon={Star} label="Leituras" value={stats.readings} color="bg-purple-500/20 text-purple-400" />
              <StatCard icon={ShoppingBag} label="Produtos" value={stats.products} color="bg-emerald-500/20 text-emerald-400" />
              <StatCard icon={ShoppingBag} label="Pedidos" value={stats.orders} color="bg-orange-500/20 text-orange-400" />
              <StatCard icon={BookOpen} label="Cursos" value={stats.courses} color="bg-blue-500/20 text-blue-400" />
              <StatCard icon={Star} label="Taromantes" value={stats.taromantes} color="bg-pink-500/20 text-pink-400" />
            </div>
          </TabsContent>

          <TabsContent value="users"><AdminUsers users={users} /></TabsContent>
          <TabsContent value="products"><AdminProducts products={products} onRefresh={loadData} /></TabsContent>
          <TabsContent value="taromantes"><AdminTaromantes taromantes={taromantes} onRefresh={loadData} /></TabsContent>
          <TabsContent value="orders"><AdminOrders orders={orders} /></TabsContent>
          <TabsContent value="consultations"><AdminConsultations consultations={consultations} /></TabsContent>
          <TabsContent value="courses"><AdminCourses courses={courses} onRefresh={loadData} /></TabsContent>
          <TabsContent value="settings"><AdminSettings settings={siteSettings} onRefresh={loadData} /></TabsContent>
          <TabsContent value="debug"><AdminDebug /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
