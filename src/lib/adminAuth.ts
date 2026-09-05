import type { AstroCookies } from 'astro';

// Senha padrão administrativa configurável via .env
const ADMIN_PASSWORD = 
  (typeof process !== 'undefined' && process.env.ADMIN_PASSWORD) || 
  import.meta.env.ADMIN_PASSWORD || 
  'admin123';

export const ADMIN_COOKIE_NAME = 'portal_admin_token';
// Token de sessão fixo derivado da senha
const SESSION_TOKEN = Buffer.from(`portal_session_${ADMIN_PASSWORD}`).toString('base64');

/**
 * Valida a senha fornecida pelo usuário
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD.trim();
}

/**
 * Retorna o valor do token de sessão esperado
 */
export function getAdminSessionToken(): string {
  return SESSION_TOKEN;
}

/**
 * Verifica se a requisição atual possui sessão de admin válida
 */
export function isAdminAuthenticated(cookies: AstroCookies | Request): boolean {
  try {
    let token: string | undefined;

    if ('get' in cookies && typeof cookies.get === 'function') {
      token = cookies.get(ADMIN_COOKIE_NAME)?.value;
    } else if (cookies instanceof Request) {
      const cookieHeader = cookies.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
      token = match ? match[1] : undefined;
    }

    return token === SESSION_TOKEN;
  } catch {
    return false;
  }
}
