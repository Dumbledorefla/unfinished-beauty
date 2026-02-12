import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users as UsersIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

export default function CursoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("courses").select("*").eq("slug", slug).eq("is_active", true).single()
      .then(({ data }) => { setCourse(data); setLoading(false); });
  }, [slug]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para Cursos
        </Link>

        {loading ? (
          <div className="h-96 rounded-xl shimmer" />
        ) : !course ? (
          <Card className="bg-card/80 backdrop-blur-md border-primary/20 text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-foreground mb-2">Curso não encontrado</h3>
              <Link to="/cursos"><Button variant="outline">Ver todos os cursos</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {course.image_url && (
              <img src={course.image_url} alt={course.title} className="w-full h-64 object-cover rounded-xl border border-primary/20" />
            )}
            <Card className="bg-card/80 backdrop-blur-md border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{course.category}</span>
                  {course.level && <span className="px-2 py-0.5 text-xs rounded-full bg-foreground/10 text-foreground/60">{course.level}</span>}
                  {course.is_free && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Grátis</span>}
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{course.title}</h1>
                {course.instructor_name && <p className="text-primary mb-4">por {course.instructor_name}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-6">
                  {course.total_lessons && <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.total_lessons} aulas</span>}
                  {course.total_duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.total_duration}h de conteúdo</span>}
                  {course.enrollment_count ? <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" />{course.enrollment_count} alunos</span> : null}
                </div>

                {course.short_description && <p className="text-foreground/70 mb-4">{course.short_description}</p>}
                {course.description && <p className="text-foreground/60 text-sm whitespace-pre-line mb-6">{course.description}</p>}

                <div className="flex items-center gap-4">
                  {!course.is_free && course.price && (
                    <span className="text-primary font-bold text-2xl">R$ {Number(course.price).toFixed(2)}</span>
                  )}
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                    {course.is_free ? "Acessar Grátis" : "Inscrever-se"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
