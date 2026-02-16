import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const baseUrl = "https://chavedooraculo.com.br";
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/tarot/dia", priority: "0.9", changefreq: "daily" },
    { url: "/tarot/amor", priority: "0.8", changefreq: "weekly" },
    { url: "/tarot/completo", priority: "0.8", changefreq: "weekly" },
    { url: "/numerologia", priority: "0.8", changefreq: "weekly" },
    { url: "/horoscopo", priority: "0.9", changefreq: "daily" },
    { url: "/mapa-astral", priority: "0.8", changefreq: "weekly" },
    { url: "/compatibilidade", priority: "0.8", changefreq: "weekly" },
    { url: "/calendario-lunar", priority: "0.7", changefreq: "monthly" },
    { url: "/consultas", priority: "0.7", changefreq: "weekly" },
    { url: "/produtos", priority: "0.6", changefreq: "weekly" },
    { url: "/cursos", priority: "0.6", changefreq: "weekly" },
    { url: "/blog", priority: "0.8", changefreq: "daily" },
    { url: "/signos", priority: "0.8", changefreq: "monthly" },
  ];

  // Signos estáticos
  const signoSlugs = ["aries", "touro", "gemeos", "cancer", "leao", "virgem", "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"];

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);

  // Cursos
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Taromantes
  const { data: taromantes } = await supabase
    .from("taromantes")
    .select("slug, updated_at")
    .eq("is_active", true);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Signos
  for (const slug of signoSlugs) {
    xml += `
  <url>
    <loc>${baseUrl}/signo/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  if (posts) {
    for (const post of posts) {
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${(post.updated_at || post.published_at || today).split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  if (courses) {
    for (const c of courses) {
      xml += `
  <url>
    <loc>${baseUrl}/curso/${c.slug}</loc>
    <lastmod>${(c.updated_at || today).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  }

  if (taromantes) {
    for (const t of taromantes) {
      xml += `
  <url>
    <loc>${baseUrl}/taromante/${t.slug}</loc>
    <lastmod>${(t.updated_at || today).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  }

  xml += "\n</urlset>";

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
});
