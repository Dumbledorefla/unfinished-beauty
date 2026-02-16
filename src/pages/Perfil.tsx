import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Clock, Star, LogOut, CalendarCheck, CalendarX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateInputBR from "@/components/DateInputBR";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getCalendarAuthUrl, getCalendarStatus, disconnectCalendar } from "@/lib/google-calendar";
import ReadingHistory from "@/components/ReadingHistory";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import heroBg from "@/assets/hero-bg.jpg";

export default function Perfil() {
  const { user, isAuthenticated, isLoading, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [readings, setReadings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<{ connected: boolean; email: string | null }>({ connected: false, email: null });
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("calendar") === "connected") {
      toast({ title: "Google Calendar conectado com sucesso!" });
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (user) {
      getCalendarStatus().then(setCalendarStatus).catch(() => {});
    }
  }, [user]);

  const handleConnectCalendar = async () => {
    setCalendarLoading(true);
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setCalendarLoading(true);
    try {
      await disconnectCalendar();
      setCalendarStatus({ connected: false, email: null });
      toast({ title: "Google Calendar desconectado" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setCalendarLoading(false);
    }
  };

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
                <DateInputBR value={birthDate} onChange={setBirthDate} className="bg-input/50 border-border/50" />
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

          <Card className="bg-card/80 backdrop-blur-md border-primary/20 mb-6">
            <CardHeader>
              <CardTitle className="gold-text flex items-center gap-2"><Calendar className="w-5 h-5" /> Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {calendarStatus.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <CalendarCheck className="w-4 h-4" />
                    <span className="text-sm">Conectado como <strong>{calendarStatus.email}</strong></span>
                  </div>
                  <p className="text-xs text-foreground/50">Suas consultas serão sincronizadas automaticamente com seu Google Calendar.</p>
                  <Button variant="outline" size="sm" onClick={handleDisconnectCalendar} disabled={calendarLoading} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    {calendarLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarX className="w-4 h-4 mr-2" />}
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/60">Conecte seu Google Calendar para sincronizar consultas e receber lembretes automaticamente.</p>
                  <Button onClick={handleConnectCalendar} disabled={calendarLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {calendarLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                    Conectar Google Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <TwoFactorSetup />

          <ReadingHistory readings={readings} />
        </motion.div>
      </main>
    </div>
  );
}
