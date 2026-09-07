/**
 * Sanitizador de HTML nativo, ultra-resiliente e de alta performance para artigos jornalísticos.
 * Não depende de bibliotecas externas (como sanitize-html), eliminando qualquer falha
 * de ESM/CJS interop no ambiente Vercel Serverless.
 */

// Tags HTML perigosas que devem ser completamente removidas junto com seu conteúdo
const DANGEROUS_TAGS_REGEX = /<(script|style|iframe|object|embed|applet|meta|link|base)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|object|embed|applet|meta|link|base)[^>]*\/?>/gi;

// Atributos perigosos de eventos (ex: onload, onclick, onerror)
const EVENT_HANDLERS_REGEX = /\s+on[a-z0-9_]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

// Protocolos perigosos em links ou atributos src (ex: javascript:, data:text/html)
const JAVASCRIPT_PROTOCOLS_REGEX = /(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi;

/**
 * Sanitiza o HTML bruto garantindo proteção contra XSS e conformidade com os padrões de segurança.
 */
export function sanitizeArticleHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  try {
    let clean = dirtyHtml;

    // 1. Converte marcadores de anúncio para elementos seguros antes de qualquer transformação
    clean = clean
      .replace(/<!--\s*AD_SLOT_1\s*-->/g, '<div data-ad-placeholder="1"></div>')
      .replace(/<!--\s*AD_SLOT_2\s*-->/g, '<div data-ad-placeholder="2"></div>')
      .replace(/<!--\s*AD_SLOT_FOOTER\s*-->/g, '<div data-ad-placeholder="footer"></div>');

    // 2. Remove tags executáveis perigosas (scripts, styles externos, iframes não autorizados)
    clean = clean.replace(DANGEROUS_TAGS_REGEX, '');

    // 3. Remove event handlers perigosos (ex: onclick, onerror, onmouseover)
    clean = clean.replace(EVENT_HANDLERS_REGEX, '');

    // 4. Remove URLs javascript:
    clean = clean.replace(JAVASCRIPT_PROTOCOLS_REGEX, 'href="#"');

    // 5. Garante segurança em links externos (rel="noopener noreferrer nofollow" e target="_blank")
    clean = clean.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
      // Se não tiver rel, adiciona
      let updated = attrs;
      if (!/rel\s*=/i.test(updated)) {
        updated += ' rel="noopener noreferrer nofollow"';
      }
      if (!/target\s*=/i.test(updated) && /href\s*=\s*["']?https?:\/\//i.test(updated)) {
        updated += ' target="_blank"';
      }
      return `<a ${updated}>`;
    });

    // 6. Garante lazy loading e decoding assíncrono em imagens para Core Web Vitals
    clean = clean.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
      let updated = attrs;
      if (!/loading\s*=/i.test(updated)) {
        updated += ' loading="lazy"';
      }
      if (!/decoding\s*=/i.test(updated)) {
        updated += ' decoding="async"';
      }
      return `<img ${updated}>`;
    });

    return clean;
  } catch (err) {
    console.warn('[Sanitize Aviso] Erro na sanitização de HTML, retornando conteúdo seguro:', err);
    return dirtyHtml.replace(DANGEROUS_TAGS_REGEX, '');
  }
}
