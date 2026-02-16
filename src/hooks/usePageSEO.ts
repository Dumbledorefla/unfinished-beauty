import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
}

export function usePageSEO({ title, description, path, image, type = "website", publishedTime, author }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("Chave do Oráculo") ? title : `${title} | Chave do Oráculo`;
    const url = `${window.location.origin}${path}`;
    const ogImage = image || `${window.location.origin}/icons/icon-512.png`;

    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("article:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:url", url);
    setMeta("og:type", type);
    setMeta("og:image", ogImage);
    setMeta("og:site_name", "Chave do Oráculo");
    setMeta("og:locale", "pt_BR");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Article specific
    if (type === "article" && publishedTime) {
      setMeta("article:published_time", publishedTime);
      if (author) setMeta("article:author", author);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = "Chave do Oráculo";
    };
  }, [title, description, path, image, type, publishedTime, author]);
}
