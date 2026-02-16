import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShoppingBag, Star, Calendar,
  BookOpen, Settings, Shield, Bug, CreditCard, Tag, ClipboardList, Share2, FileText, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminTaromantes from "@/components/admin/AdminTaromantes";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminConsultations from "@/components/admin/AdminConsultations";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminDebug from "@/components/admin/AdminDebug";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import AdminAffiliates from "@/components/admin/AdminAffiliates";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminNewsletter from "@/components/admin/AdminNewsletter";

export default function Admin() {
  const { isAuthenticated, isLoading, isAdmin, isProfileLoaded } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [taromantes, setTaromantes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
    if (!isLoading && isAuthenticated && isProfileLoaded && !isAdmin) navigate("/");
  }, [isLoading, isAuthenticated, isAdmin, isProfileLoaded]);

  useEffect(() => {
    if (isAdmin && !dataLoaded) { loadData(); setDataLoaded(true); }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [profilesRes, productsRes, ordersRes, coursesRes, taromantesRes, consultationsRes, settingsRes, couponsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("products").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("courses").select("*"),
        supabase.from("taromantes").select("*"),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*"),
        supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      ]);
      setUsers(profilesRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setCourses(coursesRes.data || []);
      setTaromantes(taromantesRes.data || []);
      setConsultations(consultationsRes.data || []);
      setSiteSettings(settingsRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (err) { console.error("Admin loadData error:", err); }
  };

  if (isLoading || !isProfileLoaded) return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando...</div>;
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
      <div className="border-b border-primary/15 bg-card/30 backdrop-blur-xl px-6 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold gold-text flex items-center gap-2.5"><Shield className="w-5 h-5 text-primary" /> Painel Admin</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-primary/20 text-foreground/70 hover:text-primary">Voltar ao Site</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-2 rounded-xl mb-8">
            <TabsTrigger value="dashboard" className="rounded-lg"><LayoutDashboard className="w-4 h-4 mr-1.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg"><Users className="w-4 h-4 mr-1.5" />Usuários</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg"><ShoppingBag className="w-4 h-4 mr-1.5" />Produtos</TabsTrigger>
            <TabsTrigger value="taromantes" className="rounded-lg"><Star className="w-4 h-4 mr-1.5" />Taromantes</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg"><CreditCard className="w-4 h-4 mr-1.5" />Pagamentos</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg"><ShoppingBag className="w-4 h-4 mr-1.5" />Pedidos</TabsTrigger>
            <TabsTrigger value="consultations" className="rounded-lg"><Calendar className="w-4 h-4 mr-1.5" />Consultas</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg"><BookOpen className="w-4 h-4 mr-1.5" />Cursos</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg"><Settings className="w-4 h-4 mr-1.5" />Config</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-lg"><Tag className="w-4 h-4 mr-1.5" />Cupons</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg"><ClipboardList className="w-4 h-4 mr-1.5" />Auditoria</TabsTrigger>
            <TabsTrigger value="affiliates" className="rounded-lg"><Share2 className="w-4 h-4 mr-1.5" />Afiliados</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg"><FileText className="w-4 h-4 mr-1.5" />Blog</TabsTrigger>
            <TabsTrigger value="newsletter" className="rounded-lg"><Mail className="w-4 h-4 mr-1.5" />Newsletter</TabsTrigger>
            <TabsTrigger value="debug" className="rounded-lg"><Bug className="w-4 h-4 mr-1.5" />Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
          <TabsContent value="users"><AdminUsers users={users} /></TabsContent>
          <TabsContent value="products"><AdminProducts products={products} onRefresh={loadData} /></TabsContent>
          <TabsContent value="taromantes"><AdminTaromantes taromantes={taromantes} onRefresh={loadData} /></TabsContent>
          <TabsContent value="payments"><AdminPayments onRefresh={loadData} /></TabsContent>
          <TabsContent value="orders"><AdminOrders orders={orders} /></TabsContent>
          <TabsContent value="consultations"><AdminConsultations consultations={consultations} /></TabsContent>
          <TabsContent value="courses"><AdminCourses courses={courses} onRefresh={loadData} /></TabsContent>
          <TabsContent value="settings"><AdminSettings settings={siteSettings} onRefresh={loadData} /></TabsContent>
          <TabsContent value="coupons"><AdminCoupons coupons={coupons} onRefresh={loadData} /></TabsContent>
          <TabsContent value="audit"><AdminAuditLog /></TabsContent>
          <TabsContent value="affiliates"><AdminAffiliates /></TabsContent>
          <TabsContent value="blog"><AdminBlog /></TabsContent>
          <TabsContent value="newsletter"><AdminNewsletter /></TabsContent>
          <TabsContent value="debug"><AdminDebug /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
