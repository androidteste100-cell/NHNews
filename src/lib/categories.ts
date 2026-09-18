import { type CategorySlug, CATEGORY_SLUGS, CategorySlugEnum } from '../types/database.types';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  bg: string;          // Classe Tailwind para o badge pill: ex 'bg-red-600'
  hoverBg: string;     // Classe hover para o badge: ex 'hover:bg-red-700'
  text: string;        // Classe de texto: ex 'text-red-600'
  hoverText: string;   // Classe hover de texto: ex 'hover:text-red-600'
  lightBg: string;     // Fundo suave de destaque
  border: string;      // Borda temática
  indicator: string;   // Traço vertical de seção temática
  hex: string;         // Cor hexadecimal
}

export type CategoryStyle = CategoryInfo;

/**
 * Categorias Oficiais do Portal de Notícias
 * 1. Polícia (policia)
 * 2. Maceió (maceio)
 * 3. Interior (interior)
 * 4. Política (politica)
 * 5. Economia (economia)
 * 6. Esporte (esporte)
 * 7. Mundo (mundo)
 * 8. Cultura, Lazer & Variedades (cultura-lazer-variedades)
 */
export const OFFICIAL_CATEGORIES: CategoryInfo[] = [
  {
    slug: 'policia',
    name: 'Polícia',
    description: 'Cobertura policial, investigações, segurança pública, operações e ocorrências em tempo real.',
    bg: 'bg-red-600',
    hoverBg: 'hover:bg-red-700',
    text: 'text-red-600',
    hoverText: 'hover:text-red-600',
    lightBg: 'bg-red-50',
    border: 'border-red-200',
    indicator: 'bg-red-600',
    hex: '#dc2626',
  },
  {
    slug: 'maceio',
    name: 'Maceió',
    description: 'Acontecimentos, trânsito, serviços públicos, bairros, praias e o dia a dia da capital alagoana.',
    bg: 'bg-sky-600',
    hoverBg: 'hover:bg-sky-700',
    text: 'text-sky-600',
    hoverText: 'hover:text-sky-600',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
    indicator: 'bg-sky-600',
    hex: '#0284c7',
  },
  {
    slug: 'interior',
    name: 'Interior',
    description: 'Notícias dos municípios do interior, do agreste ao sertão, infraestrutura regional e comunidades.',
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-700',
    text: 'text-amber-600',
    hoverText: 'hover:text-amber-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    indicator: 'bg-amber-600',
    hex: '#d97706',
  },
  {
    slug: 'brasil',
    name: 'Brasil',
    description: 'Cobertura completa de notícias nacionais, decisões federais, economia, sociedade e acontecimentos de norte a sul do país.',
    bg: 'bg-[#0077B6]',
    hoverBg: 'hover:bg-[#005f92]',
    text: 'text-[#0077B6]',
    hoverText: 'hover:text-[#0077B6]',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    indicator: 'bg-[#0077B6]',
    hex: '#0077b6',
  },
  {
    slug: 'politica',
    name: 'Política',
    description: 'Bastidores do poder, eleições, assembleia legislativa, câmara municipal, governo e decisões judiciais.',
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    text: 'text-indigo-600',
    hoverText: 'hover:text-indigo-600',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    indicator: 'bg-indigo-600',
    hex: '#4f46e5',
  },
  {
    slug: 'economia',
    name: 'Economia',
    description: 'Mercado financeiro, negócios, emprego, agronegócio, comércio, investimentos e inflação.',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    hoverText: 'hover:text-emerald-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    indicator: 'bg-emerald-600',
    hex: '#059669',
  },
  {
    slug: 'esporte',
    name: 'Esporte',
    description: 'Futebol alagoano e nacional, campeonatos, basquete, vôlei, automobilismo e esportes olímpicos.',
    bg: 'bg-green-600',
    hoverBg: 'hover:bg-green-700',
    text: 'text-green-600',
    hoverText: 'hover:text-green-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    indicator: 'bg-green-600',
    hex: '#16a34a',
  },
  {
    slug: 'mundo',
    name: 'Mundo',
    description: 'Geopolítica internacional, conflitos globais, diplomacia, meio ambiente e grandes eventos mundiais.',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    text: 'text-blue-600',
    hoverText: 'hover:text-blue-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    indicator: 'bg-blue-600',
    hex: '#2563eb',
  },
  {
    slug: 'cultura-lazer-variedades',
    name: 'Cultura, Lazer & Variedades',
    description: 'Artes, literatura, música, cinema, teatro, shows, gastronomia, turismo, entretenimento, eventos e estilo de vida.',
    bg: 'bg-purple-600',
    hoverBg: 'hover:bg-purple-700',
    text: 'text-purple-600',
    hoverText: 'hover:text-purple-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    indicator: 'bg-purple-600',
    hex: '#9333ea',
  },
];

export const CATEGORY_MAP: Record<CategorySlug, CategoryInfo> = OFFICIAL_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  },
  {} as Record<CategorySlug, CategoryInfo>
);

// Mapeamento retrocompatível para garantir que slugs antigos apontem para Cultura, Lazer & Variedades
const culturaLazerInfo = CATEGORY_MAP['cultura-lazer-variedades'];
if (culturaLazerInfo) {
  CATEGORY_MAP['cultura'] = culturaLazerInfo;
  CATEGORY_MAP['lazer-variedades'] = culturaLazerInfo;
}

export const CATEGORY_STYLES = CATEGORY_MAP;

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(slug);
}

/**
 * Normaliza qualquer string (nome, slug antigo ou texto desformatado)
 * para um dos slugs oficiais de categoria. Se a categoria for genérica ou vazia,
 * inspeciona palavras-chave do título para categorização precisa.
 */
export function normalizeCategorySlug(category?: string | null, title?: string | null): CategorySlug {
  const cleanedCat = (category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const cleanedTitle = (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Slugs diretos e aliases para Cultura, Lazer & Variedades
  if (
    cleanedCat === 'cultura-lazer-variedades' ||
    cleanedCat === 'cultura' ||
    cleanedCat === 'lazer-variedades' ||
    cleanedCat === 'cultura-lazer' ||
    cleanedCat === 'lazer' ||
    cleanedCat === 'variedades'
  ) {
    return 'cultura-lazer-variedades';
  }

  // 2. Correspondência exata de slug ativo
  if (isValidCategorySlug(cleanedCat) && cleanedCat !== 'cultura' && cleanedCat !== 'lazer-variedades') {
    return cleanedCat;
  }

  // 3. Mapeamentos por palavras-chave na categoria informada
  if (cleanedCat.includes('polic') || cleanedCat.includes('crime') || cleanedCat.includes('seguranc') || cleanedCat.includes('preso') || cleanedCat.includes('golpe')) {
    return 'policia';
  }
  if (cleanedCat.includes('maceio') || cleanedCat.includes('capital') || cleanedCat.includes('paju') || cleanedCat.includes('ponta-verde') || cleanedCat.includes('cidade')) {
    return 'maceio';
  }
  if (cleanedCat.includes('interior') || cleanedCat.includes('arapiraca') || cleanedCat.includes('sertao') || cleanedCat.includes('agreste') || cleanedCat.includes('municip')) {
    return 'interior';
  }
  if (cleanedCat.includes('politic') || cleanedCat.includes('governo') || cleanedCat.includes('eleic') || cleanedCat.includes('prefeit') || cleanedCat.includes('camara') || cleanedCat.includes('congresso') || cleanedCat.includes('senad')) {
    return 'politica';
  }
  if (cleanedCat.includes('econom') || cleanedCat.includes('financ') || cleanedCat.includes('mercado') || cleanedCat.includes('dolar') || cleanedCat.includes('inflac') || cleanedCat.includes('negocio') || cleanedCat.includes('tecnolog') || cleanedCat.includes('cienc') || cleanedCat.includes('ia')) {
    return 'economia';
  }
  if (cleanedCat.includes('esport') || cleanedCat.includes('futebol') || cleanedCat.includes('csa') || cleanedCat.includes('crb') || cleanedCat.includes('copa') || cleanedCat.includes('atlet')) {
    return 'esporte';
  }
  if (cleanedCat.includes('mundo') || cleanedCat.includes('internacional') || cleanedCat.includes('global') || cleanedCat.includes('exterior') || cleanedCat.includes('eua') || cleanedCat.includes('europa') || cleanedCat.includes('guerra')) {
    return 'mundo';
  }
  if (cleanedCat.includes('brasil') || cleanedCat.includes('nacional') || cleanedCat.includes('federal') || cleanedCat.includes('brasilia')) {
    return 'brasil';
  }
  if (cleanedCat.includes('cultur') || cleanedCat.includes('lazer') || cleanedCat.includes('variedade') || cleanedCat.includes('arte') || cleanedCat.includes('musica') || cleanedCat.includes('livro') || cleanedCat.includes('teatro') || cleanedCat.includes('cinema') || cleanedCat.includes('gastronom') || cleanedCat.includes('turismo') || cleanedCat.includes('show')) {
    return 'cultura-lazer-variedades';
  }

  // 4. Se a categoria for genérica ("geral", "noticia", vazio) ou não identificada, busca por semântica no título
  if (cleanedTitle) {
    if (cleanedTitle.includes('brasil') || cleanedTitle.includes('nacional') || cleanedTitle.includes('stf') || cleanedTitle.includes('brasilia') || cleanedTitle.includes('ministerio') || cleanedTitle.includes('receita federal')) {
      return 'brasil';
    }
    if (cleanedTitle.includes('rap') || cleanedTitle.includes('rima') || cleanedTitle.includes('musica') || cleanedTitle.includes('gastronomia') || cleanedTitle.includes('culinaria') || cleanedTitle.includes('show') || cleanedTitle.includes('teatro') || cleanedTitle.includes('cinema') || cleanedTitle.includes('cultura') || cleanedTitle.includes('lazer') || cleanedTitle.includes('festival') || cleanedTitle.includes('turismo') || cleanedTitle.includes('praia')) {
      return 'cultura-lazer-variedades';
    }
    if (cleanedTitle.includes('cnh') || cleanedTitle.includes('economia') || cleanedTitle.includes('bilho') || cleanedTitle.includes('milho') || cleanedTitle.includes('dolar') || cleanedTitle.includes('inflacao') || cleanedTitle.includes('imposto') || cleanedTitle.includes('trabalho') || cleanedTitle.includes('emprego') || cleanedTitle.includes('renda') || cleanedTitle.includes('negocio') || cleanedTitle.includes('tecnologia')) {
      return 'economia';
    }
    if (cleanedTitle.includes('policia') || cleanedTitle.includes('preso') || cleanedTitle.includes('prisao') || cleanedTitle.includes('apreens') || cleanedTitle.includes('crime') || cleanedTitle.includes('assalto') || cleanedTitle.includes('homicidio') || cleanedTitle.includes('seguranca') || cleanedTitle.includes('droga')) {
      return 'policia';
    }
    if (cleanedTitle.includes('prefeito') || cleanedTitle.includes('governador') || cleanedTitle.includes('eleicao') || cleanedTitle.includes('politica') || cleanedTitle.includes('votacao') || cleanedTitle.includes('camara') || cleanedTitle.includes('deputado')) {
      return 'politica';
    }
    if (cleanedTitle.includes('futebol') || cleanedTitle.includes('campeonato') || cleanedTitle.includes('esporte') || cleanedTitle.includes('csa') || cleanedTitle.includes('crb') || cleanedTitle.includes('gol') || cleanedTitle.includes('atleta')) {
      return 'esporte';
    }
    if (cleanedTitle.includes('arapiraca') || cleanedTitle.includes('interior') || cleanedTitle.includes('sertao') || cleanedTitle.includes('agreste') || cleanedTitle.includes('penedo') || cleanedTitle.includes('palmeira dos indios')) {
      return 'interior';
    }
    if (cleanedTitle.includes('maceio') || cleanedTitle.includes('pajucara') || cleanedTitle.includes('ponta verde') || cleanedTitle.includes('jatiuca') || cleanedTitle.includes('orla')) {
      return 'maceio';
    }
    if (cleanedTitle.includes('eua') || cleanedTitle.includes('europa') || cleanedTitle.includes('russia') || cleanedTitle.includes('ucrania') || cleanedTitle.includes('israel') || cleanedTitle.includes('mundo') || cleanedTitle.includes('internacional')) {
      return 'mundo';
    }
  }

  // Fallback padrão para a editoria principal de acontecimentos da capital
  return 'maceio';
}

export function getCategoryBySlug(slug?: string | null): CategoryInfo | undefined {
  if (!slug) return undefined;
  const normalized = normalizeCategorySlug(slug);
  return CATEGORY_MAP[normalized];
}

export function getCategoryStyle(category?: string | null, title?: string | null): CategoryInfo {
  const normalized = normalizeCategorySlug(category, title);
  return CATEGORY_MAP[normalized] || OFFICIAL_CATEGORIES[0];
}
