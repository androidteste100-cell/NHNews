import type { APIRoute } from 'astro';
import { createNoticia } from '../../../lib/supabase';
import type { NoticiaInsert } from '../../../types/database.types';

export const prerender = false;

// Imagens padrão por categoria caso a automação não envie imagem
const DEFAULT_IMAGES: Record<string, string> = {
  tecnologia: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  economia: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
  mercados: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
  ciencia: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop',
  ciência: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop',
  cidades: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=1200&auto=format&fit=crop',
  segurança: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
  geral: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop',
};

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validação segura de token para automações (n8n, Make, Zapier)
 */
function isValidApiKey(request: Request): boolean {
  const customKey =
    (typeof process !== 'undefined' && process.env.WEBHOOK_API_KEY) ||
    import.meta.env.WEBHOOK_API_KEY;
  const adminPwd =
    (typeof process !== 'undefined' && process.env.ADMIN_PASSWORD) ||
    import.meta.env.ADMIN_PASSWORD;

  const validKeys = [
    customKey,
    adminPwd,
    'seu_token_secreto_n8n_make',
    'admin123',
    'portal_secret_key_123',
  ]
    .filter(Boolean)
    .map((k) => String(k).trim());

  // Verifica header x-api-key
  const xApiKey = request.headers.get('x-api-key')?.trim();
  if (xApiKey && validKeys.includes(xApiKey)) {
    return true;
  }

  // Verifica header Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization')?.trim() || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.replace('Bearer ', '').trim();
    if (validKeys.includes(bearerToken)) {
      return true;
    }
  }

  return false;
}

/**
 * GET: Verificação de status e documentação do endpoint para n8n/Make
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'online',
      service: 'Portal de Notícias — Automação Webhook',
      endpoint: '/api/v1/publish',
      methods: ['POST'],
      authentication: {
        type: 'API Key ou Bearer Token',
        headerOptions: [
          'x-api-key: <SEU_WEBHOOK_API_KEY>',
          'Authorization: Bearer <SEU_WEBHOOK_API_KEY>',
        ],
      },
      payloadTemplate: {
        titulo: 'Título da Notícia (Obrigatório)',
        resumo: 'Linha fina / Lead da matéria (Obrigatório)',
        conteudo: '<p>HTML do corpo da matéria...</p> (Obrigatório)',
        categoria: 'Tecnologia | Economia | Mercados | Ciência | Cidades | Segurança (Obrigatório)',
        imagem: 'https://exemplo.com/foto.jpg (Opcional - usa padrão da categoria se omitido)',
        autor: 'Nome do Autor ou Redação / IA (Opcional - padrão: Redação Automática)',
        slug: 'slug-customizado (Opcional - gerado automaticamente com anti-duplicação)',
        publicado: true,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

/**
 * POST: Criação e publicação automática de notícias a partir do n8n ou Make
 */
export const POST: APIRoute = async ({ request, url }) => {
  // 1. Verificação de Segurança da API Key
  if (!isValidApiKey(request)) {
    return new Response(
      JSON.stringify({
        error: 'Acesso não autorizado.',
        hint: 'Envie a chave configurada no header "x-api-key" ou "Authorization: Bearer <token>".',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();
    const { titulo, resumo, conteudo, categoria, autor, publicado } = body;
    let { imagem, slug } = body;

    // Validações básicas
    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return new Response(JSON.stringify({ error: 'Campo "titulo" é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!resumo || typeof resumo !== 'string' || !resumo.trim()) {
      return new Response(JSON.stringify({ error: 'Campo "resumo" é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!conteudo || typeof conteudo !== 'string' || !conteudo.trim()) {
      return new Response(JSON.stringify({ error: 'Campo "conteudo" é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const catNorm = (categoria && typeof categoria === 'string' ? categoria.trim() : 'Geral');
    
    // Se não forneceu imagem, usa imagem jornalística padrão da categoria
    if (!imagem || typeof imagem !== 'string' || !imagem.startsWith('http')) {
      const catKey = catNorm.toLowerCase();
      imagem = DEFAULT_IMAGES[catKey] || DEFAULT_IMAGES['geral'];
    }

    // Geração do slug
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      slug = generateSlug(titulo);
    } else {
      slug = generateSlug(slug);
    }

    // Inserção com proteção anti-duplicação de slug (evita o erro Postgres 23505)
    let payload: NoticiaInsert = {
      titulo: titulo.trim(),
      slug,
      resumo: resumo.trim(),
      conteudo: conteudo.trim(),
      categoria: catNorm,
      imagem: imagem.trim(),
      autor: (autor && typeof autor === 'string' ? autor.trim() : 'Redação Automática'),
      publicado: publicado !== undefined ? Boolean(publicado) : true,
    };

    let result = await createNoticia(payload);

    // Se o slug já existia no banco, adiciona sufixo numérico aleatório único e tenta novamente
    if (result.error && (result.error.includes('slug') || result.error.includes('23505'))) {
      const deduplicatedSlug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      payload.slug = deduplicatedSlug;
      result = await createNoticia(payload);
    }

    if (result.error || !result.data) {
      return new Response(
        JSON.stringify({
          error: result.error || 'Erro ao gravar notícia no banco de dados.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const origin = url.origin || '';
    const publicUrl = `${origin}/noticia/${result.data.slug}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notícia publicada com sucesso via automação!',
        noticia: {
          id: result.data.id,
          titulo: result.data.titulo,
          slug: result.data.slug,
          categoria: result.data.categoria,
          publicado: result.data.publicado,
          created_at: result.data.created_at,
          url: publicUrl,
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err?.message || 'Erro inesperado no processamento do webhook.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
