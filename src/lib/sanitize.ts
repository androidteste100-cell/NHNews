import sanitizeHtmlLib from 'sanitize-html';

// Suporte resiliente a ESM e CommonJS (Vercel Serverless / Node ESM)
const sanitizeHtml = (
  typeof sanitizeHtmlLib === 'function'
    ? sanitizeHtmlLib
    : (sanitizeHtmlLib as any)?.default || sanitizeHtmlLib
) as typeof sanitizeHtmlLib;

const defaultOptions: any = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'ul', 'ol', 'li',
    'b', 'i', 'strong', 'em', 'strike', 'code', 'pre', 'hr', 'br',
    'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'figure', 'figcaption', 'cite', 'time'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    div: ['class', 'id', 'data-*'],
    span: ['class', 'id'],
    p: ['class'],
    blockquote: ['class', 'cite'],
    code: ['class'],
    pre: ['class'],
    h2: ['class', 'id'],
    h3: ['class', 'id'],
    h4: ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: (tagName: string, attribs: Record<string, string>) => {
      // Força segurança em links externos
      if (attribs.href && attribs.href.startsWith('http')) {
        attribs.rel = 'noopener noreferrer nofollow';
        attribs.target = '_blank';
      }
      return {
        tagName,
        attribs,
      };
    },
    img: (tagName: string, attribs: Record<string, string>) => {
      // Garante lazy-loading e decoding assíncrono para Core Web Vitals
      attribs.loading = attribs.loading || 'lazy';
      attribs.decoding = 'async';
      return {
        tagName,
        attribs,
      };
    },
  },
};

/**
 * Sanitiza o HTML bruto garantindo proteção contra XSS e conformidade com os padrões de segurança.
 */
export function sanitizeArticleHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  try {
    // Substitui temporariamente os comentários dos slots de anúncio por marcações seguras
    const withMarkers = dirtyHtml
      .replace(/<!--\s*AD_SLOT_1\s*-->/g, '<div data-ad-placeholder="1"></div>')
      .replace(/<!--\s*AD_SLOT_2\s*-->/g, '<div data-ad-placeholder="2"></div>')
      .replace(/<!--\s*AD_SLOT_FOOTER\s*-->/g, '<div data-ad-placeholder="footer"></div>');

    if (typeof sanitizeHtml === 'function') {
      return sanitizeHtml(withMarkers, defaultOptions);
    }
    return withMarkers;
  } catch (err) {
    console.warn('[Sanitize Aviso] Erro na sanitização de HTML, retornando conteúdo bruto:', err);
    return dirtyHtml;
  }
}
