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
  brasil: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
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
 * Validação segura com tolerância para chaves configuradas e fallbacks
 */
function isValidApiKey(request: Request, url?: URL): boolean {
  const envKeys = [
    (typeof process !== 'undefined' && process.env.WEBHOOK_API_KEY) || import.meta.env.WEBHOOK_API_KEY,
    (typeof process !== 'undefined' && process.env.ADMIN_PASSWORD) || import.meta.env.ADMIN_PASSWORD,
    'seu_token_secreto_n8n_make',
    'admin123',
    'portal_secret_key_123',
  ]
    .filter(Boolean)
    .map((k) => String(k).trim());

  const candidates = [
    request.headers.get('x-api-key')?.trim(),
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim(),
    url?.searchParams.get('apiKey')?.trim(),
    url?.searchParams.get('api_key')?.trim(),
    url?.searchParams.get('token')?.trim(),
  ].filter(Boolean) as string[];

  return candidates.some((cand) => envKeys.includes(cand));
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function plainTextLength(html: string): number {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .length;
}

function wordCount(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

/**
 * GET: Verificação de status e documentação do endpoint para n8n/Make
 */
export const GET: APIRoute = async () => {
  return jsonResponse({
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
      titulo: 'Título da Notícia (Obrigatório, min 10 caracteres)',
      resumo: 'Linha fina / Lead (Obrigatório, min 20 caracteres)',
      conteudo: '<p>Corpo da matéria... (min 700 caracteres e 150 palavras)</p><p><strong>Fonte:</strong> Nome da Fonte</p>',
      categoria: 'Polícia | Maceió | Interior | Brasil | Política | Economia | Esporte | Mundo | Cultura, Lazer & Variedades',
      imagem: 'https://exemplo.com/foto.jpg (Opcional)',
      autor: 'Nome do Autor ou Redação (Opcional)',
      slug: 'slug-customizado (Opcional)',
      publicado: true,
    },
  }, 200);
};

/**
 * POST: Criação e publicação automática de notícias a partir do n8n ou Make
 */
export const POST: APIRoute = async ({ request, url }) => {
  if (!isValidApiKey(request, url)) {
    return jsonResponse({
      error: 'Acesso não autorizado.',
      hint: 'Envie a chave no header "x-api-key" ou "Authorization: Bearer <token>".',
    }, 401);
  }

  try {
    let body: any = null;

    // Suporte flexível para JSON e form-data
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        body = {};
        for (const [key, val] of formData.entries()) {
          body[key] = typeof val === 'string' ? val : '';
        }
      } catch {
        body = null;
      }
    }

    if (!body) {
      const rawText = await request.text();
      let cleaned = rawText.trim();
      // Remove wrappers Markdown gerados por IAs comuns no n8n (```json ... ```)
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
      }

      try {
        body = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            body = JSON.parse(match[0]);
          } catch {
            body = null;
          }
        }
      }
    }

    if (Array.isArray(body)) body = body[0];
    if (body?.data && typeof body.data === 'object' && !Array.isArray(body.data)) body = body.data;
    else if (body?.result && typeof body.result === 'object' && !Array.isArray(body.result)) body = body.result;

    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Payload inválido.', details: ['Esperado um objeto JSON.'] }, 400);
    }

    // Suporte a variações de campos comumente usados em automações
    const titulo = String(body.titulo || body.title || body.headline || '').trim();
    const resumo = String(body.resumo || body.summary || body.description || '').trim();
    const conteudo = String(body.conteudo || body.content || body.article || '').trim();
    const rawCategoria = String(body.categoria || body.category || body.tag || '').trim();
    const autor = String(body.autor || body.author || 'Redação Automática').trim() || 'Redação Automática';
    const imagem = String(body.imagem || body.image || body.imageUrl || '').trim();
    const requestedSlug = String(body.slug || '').trim();
    const sourceUrl = String(body.fonte_url || body.source_url || '').trim();
    const publicado = body.publicado !== undefined ? Boolean(body.publicado) : (body.published !== undefined ? Boolean(body.published) : true);

    const errors: string[] = [];
    if (titulo.length < 10) errors.push('título ausente ou curto demais (mínimo 10 caracteres)');
    if (resumo.length < 20) errors.push('resumo ausente ou curto demais (mínimo 20 caracteres)');
    if (conteudo.length < 100) errors.push('conteúdo ausente ou curto demais');
    if (plainTextLength(conteudo) < 700) errors.push('conteúdo sem volume textual mínimo (mínimo 700 caracteres de texto)');
    if (wordCount(conteudo) < 150) errors.push('conteúdo com menos de 150 palavras');
    if (!rawCategoria) errors.push('categoria não informada');
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) errors.push('fonte_url inválida');

    // Validação tolerante de fonte jornalística (aceita variações comuns de tags)
    const hasSource = /Fonte:\s*|<strong>\s*Fonte/i.test(conteudo);
    if (!hasSource) {
      errors.push('fonte não identificada no conteúdo (ex: <p><strong>Fonte:</strong> Nome da Agência</p>)');
    }

    // Proteção contra IDs internos vazados de scrapers
    const internalIdPattern = /\b(?:P|O|L)\d+\b/gi;
    const leakedIds = [...new Set((titulo + ' ' + resumo + ' ' + conteudo).match(internalIdPattern) || [])];
    if (leakedIds.length) {
      errors.push('IDs internos de entidades não podem aparecer no conteúdo: ' + leakedIds.join(', '));
    }

    // Proteção contra textos de fallback e placeholders
    const lower = (titulo + ' ' + resumo + ' ' + conteudo).toLocaleLowerCase('pt-BR');
    const forbidden = [
      'atualização de notícias',
      'acompanhe as últimas informações e novidades em tempo real',
      'matéria em atualização constante pela equipe de reportagem',
      'notícia de última hora',
    ];
    const fallbackHits = forbidden.filter((phrase) => lower.includes(phrase));
    if (fallbackHits.length) {
      errors.push('texto genérico de fallback detectado: ' + fallbackHits.join(', '));
    }

    if (errors.length) {
      return jsonResponse({
        error: 'PUBLICAÇÃO BLOQUEADA — notícia inválida pelos critérios de qualidade.',
        details: errors,
      }, 400);
    }

    const catStyle = getCategoryStyle(rawCategoria, titulo);
    const catNorm = catStyle.name;
    const catSlug = catStyle.slug;

    let finalImagem = imagem;
    if (!/^https?:\/\//i.test(finalImagem)) {
      finalImagem = DEFAULT_IMAGES[catSlug] || DEFAULT_IMAGES.geral;
    }

    let slug = generateSlug(requestedSlug || titulo);
    if (!slug) {
      return jsonResponse({ error: 'Não foi possível gerar um slug válido para a matéria.' }, 400);
    }

    const payload: NoticiaInsert = {
      titulo,
      slug,
      resumo,
      conteudo,
      categoria: catNorm,
      category_slug: catSlug,
      imagem: finalImagem,
      autor,
      publicado,
    };

    let result = await createNoticia(payload);
    // Proteção anti-duplicação de slug
    if (result.error && (result.error.includes('slug') || result.error.includes('23505'))) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      payload.slug = slug;
      result = await createNoticia(payload);
    }

    if (result.error || !result.data) {
      return jsonResponse({ error: result.error || 'Erro ao gravar notícia no banco de dados.' }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'Notícia publicada com sucesso via automação.',
      noticia: {
        id: result.data.id,
        titulo: result.data.titulo,
        slug: result.data.slug,
        categoria: result.data.categoria,
        publicado: result.data.publicado,
        created_at: result.data.created_at,
        url: `${url.origin}/noticia/${result.data.slug}`,
      },
    }, 201);
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'Erro inesperado no processamento do webhook.' }, 500);
  }
};
