import type { APIRoute } from 'astro';
import { verifyAdminPassword, getAdminSessionToken, ADMIN_COOKIE_NAME } from '../../../lib/adminAuth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(JSON.stringify({ error: 'Informe a senha de administrador.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!verifyAdminPassword(password)) {
      return new Response(JSON.stringify({ error: 'Senha de acesso incorreta.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionToken = getAdminSessionToken();

    // Grava o cookie de sessão com SameSite=None e Secure=true para compatibilidade total com iframes e browsers modernos
    cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
      path: '/',
      httpOnly: false, // permite sincronização transparente via JS
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, token: sessionToken }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `${ADMIN_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=604800; Secure; SameSite=None`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao processar autenticação.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Set-Cookie': `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; Secure; SameSite=None`,
    },
  });
};
