import { useEffect } from "react";

interface StructuredDataProps {
  type: "WebSite" | "Service" | "Product" | "FAQPage" | "Person";
  data: Record<string, any>;
}

export function useStructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `structured-data-${type}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    };

    script.textContent = JSON.stringify(jsonLd);

    const existing = document.getElementById(`structured-data-${type}`);
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(`structured-data-${type}`);
      if (el) el.remove();
    };
  }, [type, data]);
}
