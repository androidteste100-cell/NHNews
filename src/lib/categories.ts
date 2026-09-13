export interface CategoryStyle {
  name: string;
  bg: string;          // Classe para o badge pill: ex 'bg-emerald-600'
  hoverBg: string;     // Classe hover para o badge: ex 'hover:bg-emerald-700'
  text: string;        // Classe de texto: ex 'text-emerald-600'
  hoverText: string;   // Classe hover de texto: ex 'hover:text-emerald-600'
  lightBg: string;     // Fundo suave de destaque
  border: string;      // Borda temática
  indicator: string;   // Traço vertical de seção temática
  hex: string;         // Cor hexadecimal
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  economia: {
    name: 'Economia',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    hoverText: 'hover:text-emerald-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    indicator: 'bg-emerald-600',
    hex: '#059669',
  },
  tecnologia: {
    name: 'Tecnologia',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    text: 'text-blue-600',
    hoverText: 'hover:text-blue-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    indicator: 'bg-blue-600',
    hex: '#2563eb',
  },
  mercados: {
    name: 'Mercados',
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-700',
    text: 'text-amber-600',
    hoverText: 'hover:text-amber-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    indicator: 'bg-amber-600',
    hex: '#d97706',
  },
  ciencia: {
    name: 'Ciência',
    bg: 'bg-purple-600',
    hoverBg: 'hover:bg-purple-700',
    text: 'text-purple-600',
    hoverText: 'hover:text-purple-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    indicator: 'bg-purple-600',
    hex: '#9333ea',
  },
  cidades: {
    name: 'Cidades',
    bg: 'bg-teal-600',
    hoverBg: 'hover:bg-teal-700',
    text: 'text-teal-600',
    hoverText: 'hover:text-teal-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-200',
    indicator: 'bg-teal-600',
    hex: '#0d9488',
  },
  seguranca: {
    name: 'Segurança',
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-700',
    text: 'text-rose-600',
    hoverText: 'hover:text-rose-600',
    lightBg: 'bg-rose-50',
    border: 'border-rose-200',
    indicator: 'bg-rose-600',
    hex: '#e11d48',
  },
  saude: {
    name: 'Saúde',
    bg: 'bg-cyan-600',
    hoverBg: 'hover:bg-cyan-700',
    text: 'text-cyan-600',
    hoverText: 'hover:text-cyan-600',
    lightBg: 'bg-cyan-50',
    border: 'border-cyan-200',
    indicator: 'bg-cyan-600',
    hex: '#0891b2',
  },
  politica: {
    name: 'Política',
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    text: 'text-indigo-600',
    hoverText: 'hover:text-indigo-600',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    indicator: 'bg-indigo-600',
    hex: '#4f46e5',
  },
  esportes: {
    name: 'Esportes',
    bg: 'bg-green-600',
    hoverBg: 'hover:bg-green-700',
    text: 'text-green-600',
    hoverText: 'hover:text-green-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    indicator: 'bg-green-600',
    hex: '#16a34a',
  },
  cultura: {
    name: 'Cultura',
    bg: 'bg-pink-600',
    hoverBg: 'hover:bg-pink-700',
    text: 'text-pink-600',
    hoverText: 'hover:text-pink-600',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
    indicator: 'bg-pink-600',
    hex: '#db2777',
  },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  name: 'Geral',
  bg: 'bg-slate-700',
  hoverBg: 'hover:bg-slate-800',
  text: 'text-slate-700',
  hoverText: 'hover:text-slate-700',
  lightBg: 'bg-slate-50',
  border: 'border-slate-200',
  indicator: 'bg-slate-700',
  hex: '#334155',
};

export function getCategoryStyle(category?: string | null): CategoryStyle {
  if (!category) return DEFAULT_CATEGORY_STYLE;

  const normalized = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (normalized.includes('econom') || normalized.includes('financ')) {
    return CATEGORY_STYLES.economia;
  }
  if (normalized.includes('tecnolog') || normalized.includes('ia') || normalized.includes('software') || normalized.includes('comput')) {
    return CATEGORY_STYLES.tecnologia;
  }
  if (normalized.includes('mercado') || normalized.includes('negocio') || normalized.includes('empresa') || normalized.includes('invest')) {
    return CATEGORY_STYLES.mercados;
  }
  if (
    normalized.includes('cienc') ||
    normalized.includes('sustentab') ||
    normalized.includes('meio ambiente') ||
    normalized.includes('clima') ||
    normalized.includes('pesquisa')
  ) {
    return CATEGORY_STYLES.ciencia;
  }
  if (normalized.includes('cidade') || normalized.includes('urban') || normalized.includes('municip')) {
    return CATEGORY_STYLES.cidades;
  }
  if (normalized.includes('seguranc') || normalized.includes('polic') || normalized.includes('crime') || normalized.includes('justic')) {
    return CATEGORY_STYLES.seguranca;
  }
  if (normalized.includes('saud') || normalized.includes('medic') || normalized.includes('hospital')) {
    return CATEGORY_STYLES.saude;
  }
  if (normalized.includes('politic') || normalized.includes('governo') || normalized.includes('congresso')) {
    return CATEGORY_STYLES.politica;
  }
  if (normalized.includes('esport') || normalized.includes('futebol') || normalized.includes('jogos')) {
    return CATEGORY_STYLES.esportes;
  }
  if (normalized.includes('cultur') || normalized.includes('art') || normalized.includes('cinem') || normalized.includes('musica')) {
    return CATEGORY_STYLES.cultura;
  }

  return CATEGORY_STYLES[normalized] || DEFAULT_CATEGORY_STYLE;
}
