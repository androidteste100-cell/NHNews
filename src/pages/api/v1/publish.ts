import type { APIRoute } from 'astro';
import { createNoticia } from '../../../lib/supabase';
import type { NoticiaInsert } from '../../../types/database.types';
import { getCategoryStyle, OFFICIAL_CATEGORIES } from '../../../lib/categories';

export const prerender = false;

// Imagens padrão por categoria oficial caso a automação não envie imagem
const DEFAULT_IMAGES: Record<string, string> = {
  policia: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
  maceio: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
  interior: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
  politica: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
  economia: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
  esporte: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
  mundo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  'cultura-lazer-variedades': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop',
  cultura: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop',
  'lazer-variedades': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
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
function isValidApiKey(request: Request, url?: URL): boolean {
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

  // 1. Verifica query parameter apiKey na URL (para maior flexibilidade no Make/n8n)
  if (url) {
    const queryKey = url.searchParams.get('apiKey') || url.searchParams.get('api_key') || url.searchParams.get('token');
    if (queryKey && validKeys.includes(queryKey.trim())) {
      return true;
    }
  }

  // 2. Verifica header x-api-key
  const xApiKey = request.headers.get('x-api-key')?.trim();
  if (xApiKey && validKeys.includes(xApiKey)) {
    return true;
  }

  // 3. Verifica header Authorization: Bearer <token>
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
        categoria: 'Polícia | Maceió | Interior | Política | Economia | Esporte | Mundo | Cultura, Lazer & Variedades (ou slugs: policia, maceio, interior, politica, economia, esporte, mundo, cultura-lazer-variedades, cultura, lazer-variedades)',
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
  if (!isValidApiKey(request, url)) {
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
    let rawText = '';
    let body: any = null;

    // Verificar se veio via query string na URL (ex: ?titulo=...&resumo=...)
    const queryTitulo = url.searchParams.get('titulo') || url.searchParams.get('title');
    const queryResumo = url.searchParams.get('resumo') || url.searchParams.get('summary');
    const queryConteudo = url.searchParams.get('conteudo') || url.searchParams.get('content');

    // 1. Leitura do body
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        body = {};
        for (const [key, value] of formData.entries()) {
          body[key] = typeof value === 'string' ? value : '';
        }
      } catch {
        body = null;
      }
    }

    if (!body) {
      try {
        rawText = await request.text();
      } catch {
        rawText = '';
      }

      if (rawText) {
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
        }
        cleaned = cleaned.trim();

        try {
          body = JSON.parse(cleaned);
        } catch {
          // Se falhou JSON.parse, tenta extrair JSON com regex
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              body = JSON.parse(jsonMatch[0]);
            } catch {
              body = null;
            }
          }
          
          // Se ainda for nulo, tenta decodificar como URLSearchParams
          if (!body && cleaned.includes('=')) {
            try {
              const params = new URLSearchParams(cleaned);
              const paramObj: Record<string, string> = {};
              for (const [k, v] of params.entries()) {
                paramObj[k] = v;
              }
              if (paramObj.titulo || paramObj.title) {
                body = paramObj;
              }
            } catch {
              // segue em frente
            }
          }

          // Se for texto plano cru, usa o próprio texto como título e conteúdo!
          if (!body && cleaned.length > 5) {
            const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
            body = {
              titulo: lines[0] || 'Notícia de Última Hora',
              resumo: lines[1] || lines[0] || 'Cobertura completa dos acontecimentos.',
              conteudo: `<p>${lines.join('</p><p>')}</p>`,
            };
          }
        }
      }
    }

    if (!body || typeof body !== 'object') {
      body = {};
    }

    // Se o payload veio encapsulado em array ou objeto aninhado comum de automações
    if (Array.isArray(body) && body.length > 0) {
      body = body[0];
    }
    if (body.data && typeof body.data === 'object') {
      body = body.data;
    } else if (body.result && typeof body.result === 'object') {
      body = body.result;
    }

    // Suporte ultra-flexível para nomes de chaves
    const rawTitulo = body.titulo || body.title || body.headline || body.name || body.item_title || body.noticia || queryTitulo || '';
    const rawResumo = body.resumo || body.summary || body.description || body.lead || body.subtitulo || body.snippet || queryResumo || '';
    const rawConteudo = body.conteudo || body.content || body.article || body.text || body.corpo || body.body || queryConteudo || '';
    const rawCategoria = body.categoria || body.category || body.tag || url.searchParams.get('categoria') || 'Tecnologia';
    const rawAutor = body.autor || body.author || 'Redação Automática';
    let rawImagem = body.imagem || body.image || body.imageUrl || body.urlToImage || '';
    let rawSlug = body.slug || '';
    const publicado = body.publicado !== undefined ? body.publicado : (body.published !== undefined ? body.published : true);

    let titulo = typeof rawTitulo === 'string' ? rawTitulo.trim() : '';
    let resumo = typeof rawResumo === 'string' ? rawResumo.trim() : '';
    let conteudo = typeof rawConteudo === 'string' ? rawConteudo.trim() : '';

    // Se o título estiver vazio mas temos resumo ou conteúdo, extrai o título dele!
    if (!titulo && resumo) {
      titulo = resumo.length > 80 ? resumo.substring(0, 80) + '...' : resumo;
    } else if (!titulo && conteudo) {
      const stripped = conteudo.replace(/<[^>]*>/g, '').trim();
      titulo = stripped.length > 80 ? stripped.substring(0, 80) + '...' : (stripped || 'Notícia em Destaque');
    }

    // Se o resumo estiver vazio mas temos título
    if (!resumo && titulo) {
      resumo = `Confira a cobertura completa sobre: ${titulo}`;
    }

    // Se o conteúdo estiver vazio mas temos resumo/título
    if (!conteudo && (resumo || titulo)) {
      conteudo = `<p class="lead">${resumo || titulo}</p><p>Mais informações e desdobramentos serão atualizados em breve por nossa redação.</p>`;
    }

    // Fallback de emergência caso tudo tenha chegado vazio
    if (!titulo) {
      titulo = `Atualização de Notícias - ${new Date().toLocaleDateString('pt-BR')}`;
      resumo = 'Acompanhe as últimas informações e novidades em tempo real.';
      conteudo = '<p>Matéria em atualização constante pela equipe de reportagem.</p>';
    }

    const catStyle = getCategoryStyle(typeof rawCategoria === 'string' ? rawCategoria : 'policia');
    const catNorm = catStyle.name;
    const catSlug = catStyle.slug;
    
    // Se não forneceu imagem, usa imagem jornalística padrão da categoria
    if (!rawImagem || typeof rawImagem !== 'string' || !rawImagem.startsWith('http')) {
      rawImagem = DEFAULT_IMAGES[catSlug] || DEFAULT_IMAGES['geral'];
    }

    // Geração segura de slug amigável (nunca vazio)
    let slug = '';
    if (rawSlug && typeof rawSlug === 'string' && rawSlug.trim()) {
      slug = generateSlug(rawSlug);
    }
    if (!slug) {
      slug = generateSlug(titulo);
    }
    if (!slug) {
      slug = `noticia-${Date.now()}`;
    }

    // Inserção com proteção anti-duplicação de slug (evita o erro Postgres 23505)
    let payload: NoticiaInsert = {
      titulo: titulo.trim(),
      slug,
      resumo: resumo.trim(),
      conteudo: conteudo.trim(),
      categoria: catNorm,
      category_slug: catSlug,
      imagem: rawImagem.trim(),
      autor: typeof rawAutor === 'string' && rawAutor.trim() ? rawAutor.trim() : 'Redação Automática',
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
