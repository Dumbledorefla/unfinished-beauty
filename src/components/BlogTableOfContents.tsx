import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
}

export default function BlogTableOfContents({ content }: BlogTableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const extracted: TocItem[] = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const id = match[2]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      extracted.push({
        id,
        text: match[2].replace(/\*\*/g, ""),
        level: match[1].length,
      });
    }
    setItems(extracted);
  }, [content]);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false);
    }
  };

  if (items.length < 3) return null;

  return (
    <>
      {/* Desktop — lateral fixa */}
      <nav className="hidden xl:block sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <List className="w-3.5 h-3.5" /> Neste artigo
        </p>
        <ul className="space-y-1.5 border-l border-border/30">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className={`block text-left text-sm leading-snug transition-all duration-200 border-l-2 -ml-px
                  ${item.level === 3 ? "pl-6" : "pl-4"}
                  ${activeId === item.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile — dropdown */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-secondary/60 backdrop-blur-md border border-primary/20 rounded-xl text-sm"
        >
          <span className="flex items-center gap-2 text-foreground font-medium">
            <List className="w-4 h-4 text-primary" /> Índice do artigo
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-secondary/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden"
            >
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`block w-full text-left text-sm py-2.5 transition-colors
                      ${item.level === 3 ? "pl-8" : "pl-5"}
                      ${activeId === item.id ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
