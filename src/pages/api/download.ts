import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const GET: APIRoute = async () => {
  const zipPath = path.join(process.cwd(), 'public', 'portal-noticias.zip');

  if (!fs.existsSync(zipPath)) {
    return new Response('Arquivo ZIP não encontrado.', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(zipPath);

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="portal-noticias.zip"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-cache',
    },
  });
};
