import { useEffect, useState } from "react";

export default function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop + window.innerHeight * 0.3;
      const pct = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
      setProgress(pct);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-border/20">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-amber-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
