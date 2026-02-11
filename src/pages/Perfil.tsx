import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Clock, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

export default function Perfil() {
  const { user, isAuthenticated, isLoading, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [readings, setReadings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      supabase.from("tarot_readings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
        .then(({ data }) => setReadings(data || []));

      supabase.from("profiles").select("birth_date").eq("user_id", user.id).single()
        .then(({ data }) => { if (data?.birth_date) setBirthDate(data.birth_date); });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, birth_date: birthDate || null }).eq("user_id", user.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Perfil atualizado!" });
    setSaving(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando...</div>;

  const readingTypeNames: Record<string, string> = { dia: "Tarot do Dia", amor: "Tarot e o Amor", completo: "Tarot Completo" };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 mb-6">
            <CardHeader>
              <CardTitle className="gold-text flex items-center gap-2"><User className="w-5 h-5" /> Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Nome</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-input/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">E-mail</Label>
                <Input value={user?.email || ""} disabled className="bg-input/30 border-border/30 text-foreground/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Data de Nascimento</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-input/50 border-border/50" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => { signOut(); navigate("/"); }} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-md border-primary/20">
            <CardHeader>
              <CardTitle className="gold-text flex items-center gap-2"><Clock className="w-5 h-5" /> Histórico de Leituras</CardTitle>
            </CardHeader>
            <CardContent>
              {readings.length === 0 ? (
                <p className="text-foreground/50 text-center py-8">Nenhuma leitura ainda. Faça sua primeira leitura!</p>
              ) : (
                <div className="space-y-3">
                  {readings.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{readingTypeNames[r.reading_type] || r.reading_type}</p>
                          <p className="text-xs text-foreground/50">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
