import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users as UsersIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  category: string;
  level: string | null;
  price: number | null;
  is_free: boolean | null;
  total_lessons: number | null;
  total_duration: number | null;
  image_url: string | null;
  enrollment_count: number | null;
  instructor_name: string | null;
}

export default function Cursos() {
  usePageSEO({ title: "Cursos de Tarot e Esoterismo", description: "Aprenda Tarot, Astrologia e Numerologia com cursos online de especialistas.", path: "/cursos" });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => {
      setCourses(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Aprenda Conosco</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Cursos</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">Aprofunde seus conhecimentos em tarot, numerologia e astrologia</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl shimmer" />)}
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em breve</h3>
              <p className="text-foreground/60">Nossos cursos estarão disponíveis em breve.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-all overflow-hidden">
                  {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-40 object-cover" />}
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{c.category}</span>
                      {c.is_free && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Grátis</span>}
                    </div>
                    <Link to={`/curso/${c.slug}`} className="font-serif text-lg font-bold text-foreground mb-1 hover:text-primary transition-colors">{c.title}</Link>
                    {c.short_description && <p className="text-foreground/60 text-sm mb-3">{c.short_description}</p>}
                    <div className="flex gap-4 text-xs text-foreground/50 mb-4">
                      {c.total_lessons && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.total_lessons} aulas</span>}
                      {c.total_duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.total_duration}h</span>}
                      {c.enrollment_count ? <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{c.enrollment_count}</span> : null}
                    </div>
                    {!c.is_free && c.price && (
                      <p className="text-primary font-bold text-lg mb-3">R$ {Number(c.price).toFixed(2)}</p>
                    )}
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      {c.is_free ? "Acessar Grátis" : "Inscrever-se"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
