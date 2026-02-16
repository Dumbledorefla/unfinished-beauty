import { useEffect } from "react";

interface ArticleSchema {
  type: "article";
  title: string;
  description: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

interface FAQSchema {
  type: "faq";
  questions: { question: string; answer: string }[];
}

interface ServiceSchema {
  type: "service";
  name: string;
  description: string;
  price?: string;
  url: string;
}

interface WebsiteSchema {
  type: "website";
  name: string;
  description: string;
  url: string;
}

interface BreadcrumbSchema {
  type: "breadcrumb";
  items: { name: string; url: string }[];
}

type SchemaData = ArticleSchema | FAQSchema | ServiceSchema | WebsiteSchema | BreadcrumbSchema;

export function useStructuredData(schemas: SchemaData[]) {
  useEffect(() => {
    const scriptIds: string[] = [];

    schemas.forEach((schema, index) => {
      const id = `structured-data-${index}`;
      scriptIds.push(id);

      const existing = document.getElementById(id);
      if (existing) existing.remove();

      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";

      let jsonLd: Record<string, unknown>;

      switch (schema.type) {
        case "article":
          jsonLd = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: schema.title,
            description: schema.description,
            image: schema.image,
            author: { "@type": "Organization", name: schema.author },
            publisher: {
              "@type": "Organization",
              name: "Chave do Oráculo",
              logo: { "@type": "ImageObject", url: `${window.location.origin}/icons/icon-512.png` },
            },
            datePublished: schema.datePublished,
            dateModified: schema.dateModified || schema.datePublished,
            mainEntityOfPage: { "@type": "WebPage", "@id": schema.url },
          };
          break;

        case "faq":
          jsonLd = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: schema.questions.map((q) => ({
              "@type": "Question",
              name: q.question,
              acceptedAnswer: { "@type": "Answer", text: q.answer },
            })),
          };
          break;

        case "service":
          jsonLd = {
            "@context": "https://schema.org",
            "@type": "Service",
            name: schema.name,
            description: schema.description,
            provider: { "@type": "Organization", name: "Chave do Oráculo" },
            url: schema.url,
            ...(schema.price && {
              offers: {
                "@type": "Offer",
                price: schema.price,
                priceCurrency: "BRL",
              },
            }),
          };
          break;

        case "website":
          jsonLd = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: schema.name,
            description: schema.description,
            url: schema.url,
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: `${schema.url}/blog?q={search_term_string}` },
              "query-input": "required name=search_term_string",
            },
          };
          break;

        case "breadcrumb":
          jsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: schema.items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.name,
              item: item.url,
            })),
          };
          break;
      }

      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    });

    return () => {
      scriptIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [schemas]);
}
