import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

function AnimatedStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
        >
          <span className="text-primary/40 text-xs">✦</span>
        </motion.div>
      ))}
    </div>
  );
}

interface OracleLayoutProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  extraContent?: ReactNode;
}

export default function OracleLayout({ title, icon, children, extraContent }: OracleLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      </div>
      <AnimatedStars />

      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-primary/15 bg-background/20 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-all duration-200 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <Home className="w-4 h-4" />
          <span className="text-sm">Início</span>
        </Link>
        <h1 className="font-serif text-xl font-bold text-primary flex items-center gap-2.5">
          {icon}
          {title}
        </h1>
        <div className="w-24" />
      </header>

      <main className="relative z-10 container mx-auto px-4 py-10 max-w-3xl">
        {children}
      </main>
      {extraContent && (
        <section className="relative z-10 container mx-auto px-4 pb-16 max-w-3xl">
          {extraContent}
        </section>
      )}
    </div>
  );
}
