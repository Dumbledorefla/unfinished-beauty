import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, ShoppingBag, Star, Calendar,
  BookOpen, Settings, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Admin() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Stats
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
    if (isAdmin && !dataLoaded) {
      loadData();
      setDataLoaded(true);
    }
  }, [isAdmin]);

  const loadData = async () => {
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

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardContent className="pt-4 pb-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
        <div><p className="text-foreground/60 text-sm">{label}</p><p className="text-2xl font-bold text-foreground">{value}</p></div>
      </CardContent>
    </Card>
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

          <TabsContent value="users">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Usuários ({users.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Criado em</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}><TableCell>{u.display_name || "—"}</TableCell><TableCell>{u.email}</TableCell><TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Produtos ({products.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Ativo</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.category}</TableCell><TableCell>R$ {Number(p.price).toFixed(2)}</TableCell><TableCell>{p.is_active ? "✅" : "❌"}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taromantes">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Taromantes ({taromantes.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Título</TableHead><TableHead>Rating</TableHead><TableHead>Ativo</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {taromantes.map((t) => (
                      <TableRow key={t.id}><TableCell>{t.name}</TableCell><TableCell>{t.title || "—"}</TableCell><TableCell>{t.rating || "—"}</TableCell><TableCell>{t.is_active ? "✅" : "❌"}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Pedidos ({orders.length})</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhum pedido ainda.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}><TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell><TableCell>R$ {Number(o.total_amount).toFixed(2)}</TableCell><TableCell>{o.status}</TableCell><TableCell>{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Consultas ({consultations.length})</CardTitle></CardHeader>
              <CardContent>
                {consultations.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhuma consulta ainda.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Preço</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {consultations.map((c) => (
                        <TableRow key={c.id}><TableCell>{c.consultation_type}</TableCell><TableCell>{c.status}</TableCell><TableCell>R$ {Number(c.price).toFixed(2)}</TableCell><TableCell>{new Date(c.scheduled_at).toLocaleDateString("pt-BR")}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Cursos ({courses.length})</CardTitle></CardHeader>
              <CardContent>
                {courses.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhum curso ainda.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Ativo</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {courses.map((c) => (
                        <TableRow key={c.id}><TableCell>{c.title}</TableCell><TableCell>{c.category}</TableCell><TableCell>{c.is_free ? "Grátis" : `R$ ${Number(c.price).toFixed(2)}`}</TableCell><TableCell>{c.is_active ? "✅" : "❌"}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader><CardTitle>Configurações do Site</CardTitle></CardHeader>
              <CardContent>
                {siteSettings.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhuma configuração definida.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Chave</TableHead><TableHead>Valor</TableHead><TableHead>Categoria</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {siteSettings.map((s) => (
                        <TableRow key={s.id}><TableCell>{s.label || s.key}</TableCell><TableCell className="max-w-xs truncate">{s.value}</TableCell><TableCell>{s.category}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
