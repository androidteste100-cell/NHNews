import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '../../../lib/adminAuth';
import {
  getAllNoticiasAdmin,
  createNoticia,
  updateNoticia,
  deleteNoticia,
  deleteAllNoticias,
  toggleNoticiaStatus,
} from '../../../lib/supabase';
import type { NoticiaInsert, NoticiaUpdate } from '../../../types/database.types';

export const prerender = false;

// Helper para gerar slug amigável
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
 * GET: Lista todas as notícias (painel admin)
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies, request)) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const noticias = await getAllNoticiasAdmin();
    return new Response(JSON.stringify({ noticias }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao carregar notícias.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST: Cria uma nova notícia
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies, request)) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { titulo, resumo, conteudo, categoria, imagem, autor, publicado } = body;
    let { slug } = body;

    if (!titulo?.trim()) {
      return new Response(JSON.stringify({ error: 'O título da notícia é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!resumo?.trim()) {
      return new Response(JSON.stringify({ error: 'O resumo da notícia é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!conteudo?.trim()) {
      return new Response(JSON.stringify({ error: 'O conteúdo da notícia é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!categoria?.trim()) {
      return new Response(JSON.stringify({ error: 'A categoria da notícia é obrigatória.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!imagem?.trim()) {
      return new Response(JSON.stringify({ error: 'A URL da imagem é obrigatória.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!slug?.trim()) {
      slug = generateSlug(titulo);
    } else {
      slug = generateSlug(slug);
    }

    const payload: NoticiaInsert = {
      titulo: titulo.trim(),
      slug,
      resumo: resumo.trim(),
      conteudo: conteudo.trim(),
      categoria: categoria.trim(),
      imagem: imagem.trim(),
      autor: autor?.trim() || 'Redação',
      publicado: publicado !== undefined ? Boolean(publicado) : true,
    };

    const { data, error } = await createNoticia(payload);

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, noticia: data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao processar criação de notícia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * PUT: Atualiza notícia existente
 */
export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies, request)) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { id, titulo, resumo, conteudo, categoria, imagem, autor, publicado } = body;
    let { slug } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID da notícia não informado.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!titulo?.trim()) {
      return new Response(JSON.stringify({ error: 'O título da notícia é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (slug?.trim()) {
      slug = generateSlug(slug);
    } else {
      slug = generateSlug(titulo);
    }

    const payload: NoticiaUpdate = {
      titulo: titulo.trim(),
      slug,
      resumo: resumo?.trim() || '',
      conteudo: conteudo?.trim() || '',
      categoria: categoria?.trim() || 'Geral',
      imagem: imagem?.trim() || '',
      autor: autor?.trim() || 'Redação',
      publicado: publicado !== undefined ? Boolean(publicado) : true,
    };

    const { data, error } = await updateNoticia(id, payload);

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, noticia: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao atualizar notícia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * DELETE: Exclui uma notícia individual ou todas as notícias em lote
 */
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies, request)) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const all = url.searchParams.get('all') === 'true' || url.searchParams.get('all') === '1';

    // Exclusão em lote de todas as matérias
    if (all) {
      const { success, count, error } = await deleteAllNoticias();

      if (!success || error) {
        return new Response(JSON.stringify({ error: error || 'Não foi possível excluir todas as notícias.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, count, message: 'Todas as notícias foram excluídas com sucesso.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID da notícia é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { success, error } = await deleteNoticia(id);

    if (!success || error) {
      return new Response(JSON.stringify({ error: error || 'Não foi possível excluir a notícia.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao excluir notícia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * PATCH: Alterna status de publicação
 */
export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies, request)) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { id, publicado } = body;

    if (!id || publicado === undefined) {
      return new Response(JSON.stringify({ error: 'Parâmetros inválidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { success, error } = await toggleNoticiaStatus(id, Boolean(publicado));

    if (!success || error) {
      return new Response(JSON.stringify({ error: error || 'Falha ao alterar status.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao alterar status da notícia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
