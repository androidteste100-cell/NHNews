import type { APIRoute } from 'astro';
import { getRecentNoticias } from '../lib/supabase';

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site ? site.origin : url.origin;
  const noticias = await getRecentNoticias(25);

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Portal de Notícias</title>
    <description>Cobertura jornalística ágil, automatizada e em tempo real</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro SSR Portal de Notícias</generator>
    ${noticias
      .map((item) => {
        const itemUrl = `${baseUrl}/noticia/${item.slug}`;
        const pubDate = new Date(item.created_at).toUTCString();
        return `
    <item>
      <title><![CDATA[${item.titulo}]]></title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <description><![CDATA[${item.resumo}]]></description>
      <dc:creator><![CDATA[${item.autor}]]></dc:creator>
      <category><![CDATA[${item.categoria}]]></category>
      <pubDate>${pubDate}</pubDate>
      <media:content url="${item.imagem}" medium="image" type="image/jpeg" />
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rssXml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
    },
  });
};
