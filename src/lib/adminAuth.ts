import type { AstroCookies } from 'astro';

// Senha padrão administrativa configurável via .env
export const CONFIGURED_ADMIN_PASSWORD = 
  (typeof process !== 'undefined' && process.env.ADMIN_PASSWORD) || 
  import.meta.env.ADMIN_PASSWORD || 
  '014789';

export const DEFAULT_ADMIN_PASSWORD = 'admin123';
export const PIN_ADMIN_PASSWORD = '014789';

export const ADMIN_COOKIE_NAME = 'portal_admin_token';

function toBase64(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return str;
  }
}

// Conjunto de tokens válidos aceitos pelo sistema (incluindo literais base64 e senhas diretas)
const VALID_TOKENS = new Set<string>([
  'cG9ydGFsX3Nlc3Npb25fMDE0Nzg5',
  'cG9ydGFsX3Nlc3Npb25fYWRtaW4xMjM=',
  '014789',
  'admin123',
  toBase64(`portal_session_${CONFIGURED_ADMIN_PASSWORD.trim()}`),
  toBase64(`portal_session_${DEFAULT_ADMIN_PASSWORD}`),
  toBase64(`portal_session_${PIN_ADMIN_PASSWORD}`),
]);

const PRIMARY_SESSION_TOKEN = 'cG9ydGFsX3Nlc3Npb25fMDE0Nzg5';

/**
 * Valida a senha fornecida pelo usuário
 * Aceita a senha do .env (014789), o PIN direto e admin123
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const p = password.trim();
  return (
    p === CONFIGURED_ADMIN_PASSWORD.trim() ||
    p === DEFAULT_ADMIN_PASSWORD ||
    p === PIN_ADMIN_PASSWORD
  );
}

/**
 * Retorna o valor do token de sessão principal
 */
export function getAdminSessionToken(): string {
  return PRIMARY_SESSION_TOKEN;
}

/**
 * Valida se um token é válido
 */
export function isValidAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const clean = token.trim();
  return VALID_TOKENS.has(clean);
}

/**
 * Verifica se a requisição atual possui sessão de admin válida
 * Suporta cookies, headers (Authorization: Bearer / x-admin-token) e query parameters
 */
export function isAdminAuthenticated(
  cookiesOrRequest?: AstroCookies | Request | any,
  fallbackRequest?: Request
): boolean {
  try {
    // 1. Verificação via Request (headers e URL)
    const checkRequest = (req: Request): boolean => {
      try {
        // Query param ?auth= ou ?token=
        const url = new URL(req.url, 'http://localhost:3000');
        const queryAuth = url.searchParams.get('auth') || url.searchParams.get('token');
        if (isValidAdminToken(queryAuth)) return true;

        // Authorization: Bearer <token>
        const authHeader = req.headers.get('authorization') || '';
        if (authHeader.toLowerCase().startsWith('bearer ')) {
          const bearer = authHeader.slice(7).trim();
          if (isValidAdminToken(bearer)) return true;
        }

        // x-admin-token
        const xAdmin = req.headers.get('x-admin-token');
        if (isValidAdminToken(xAdmin)) return true;

        // Header de cookie padrão
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
        if (match && isValidAdminToken(decodeURIComponent(match[1]))) return true;
      } catch {}
      return false;
    };

    if (cookiesOrRequest instanceof Request) {
      if (checkRequest(cookiesOrRequest)) return true;
    }

    if (fallbackRequest instanceof Request) {
      if (checkRequest(fallbackRequest)) return true;
    }

    // 2. Verificação via AstroCookies
    if (cookiesOrRequest && typeof cookiesOrRequest.get === 'function') {
      const token = cookiesOrRequest.get(ADMIN_COOKIE_NAME)?.value;
      if (isValidAdminToken(token)) return true;
    }

    return false;
  } catch {
    return false;
  }
}
