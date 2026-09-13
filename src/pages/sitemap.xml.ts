import type { APIRoute } from 'astro';
import { getAllSlugs } from '../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../lib/categories';

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site ? site.origin : url.origin;
  const slugs = await getAllSlugs();

  const staticRoutes = [
    '',
    ...OFFICIAL_CATEGORIES.map((cat) => `/categoria/${cat.slug}`),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>hourly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${slugs
    .map(
      (item) => `
  <url>
    <loc>${baseUrl}/noticia/${item.slug}</loc>
    <lastmod>${new Date(item.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
    },
  });
};
