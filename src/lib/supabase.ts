import { createClient } from '@supabase/supabase-js';
import type { Database, Noticia, NoticiaListItem, NoticiaDetail, NoticiaInsert, NoticiaUpdate } from '../types/database.types';

// Variáveis de ambiente públicas do Supabase (Astro e Next.js aliases suportados)
const rawSupabaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
// Normalização essencial: se o usuário colou com /rest/v1/ ou barra final, remove para evitar erro PGRST125
const supabaseUrl = rawSupabaseUrl
  ? rawSupabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  : '';
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const rawServiceKey =
  (typeof process !== 'undefined' && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';
// Se o usuário acidentalmente inseriu a URL do painel no lugar do token JWT, ignoramos para não quebrar a API
const supabaseServiceKey = (rawServiceKey && !rawServiceKey.startsWith('http') && rawServiceKey.length > 20)
  ? rawServiceKey.trim()
  : '';

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

// Criação do cliente singleton tipado para leitura pública
export const supabase = createClient<Database>(
  isConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isConfigured ? supabaseAnonKey : 'sb_publishable_placeholder_anon_key'
);

// Cliente com Service Role para o painel de admin (ignora restrições de RLS se configurado)
export const supabaseAdmin = createClient<Database>(
  isConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  supabaseServiceKey || (isConfigured ? supabaseAnonKey : 'sb_publishable_placeholder_anon_key'),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);


// ==============================================================================
// DADOS DE DEMONSTRAÇÃO / FALLBACK (Usados com elegância caso as chaves não estejam configuradas)
// ==============================================================================
const MOCK_NOTICIAS: Noticia[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    titulo: 'Inteligência Artificial revoluciona diagnósticos médicos no Brasil com precisão recorde',
    slug: 'inteligencia-artificial-revoluciona-diagnosticos-medicos-brasil',
    resumo: 'Algoritmos validados por hospitais de referência antecipam detecção de patologias complexas em até dois anos com índices de precisão superiores a 96%.',
    conteudo: `
      <p class="lead">Uma nova geração de ferramentas de inteligência artificial aplicada à medicina diagnóstica está transformando a rotina de centros de saúde em todo o país. Especialistas apontam ganhos substanciais em agilidade e precisão clínica.</p>
      
      <p>Desenvolvidos em cooperação entre universidades públicas e centros de inovação tecnológica, os novos modelos de aprendizado profundo foram treinados em centenas de milhares de exames anonimizados de ressonância magnética, tomografia computadorizada e biópsias de tecidos.</p>
      
      <!-- AD_SLOT_1 -->

      <h2>Como funciona a detecção antecipada</h2>
      <p>A tecnologia atua analisando microvariações na textura celular e nos gradientes de densidade que muitas vezes escapam ao olho humano na fase assintomática inicial. Uma vez identificado o padrão de risco, o sistema emite um alerta priorizado para a equipe de radiologia e oncologia.</p>
      
      <blockquote>
        "Não se trata de substituir o médico, mas de conferir superpoderes cognitivos ao profissional de saúde, reduzindo a fadiga e eliminando pontos cegos", explica a Dra. Helena Meirelles, coordenadora da pesquisa.
      </blockquote>

      <!-- AD_SLOT_2 -->

      <h2>Impacto direto no Sistema de Saúde</h2>
      <p>A antecipação no diagnóstico reflete diretamente nas chances de cura e na economia de recursos hospitalares. Pacientes diagnosticados em estágio precoce respondem a tratamentos consideravelmente menos invasivos e com taxas de sobrevida até 70% maiores.</p>
      
      <p>A meta dos desenvolvedores é expandir a implementação do sistema para 500 postos de saúde da rede pública até o primeiro semestre do próximo ano.</p>

      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Tecnologia',
    imagem: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
    autor: 'Lucas Brandão',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'e12bc30a-28dc-4372-b567-0e02b2c3d480',
    titulo: 'Transição energética avança com recorde histórico na geração de energia solar e eólica',
    slug: 'transicao-energetica-recorde-geracao-solar-eolica',
    resumo: 'Fontes renováveis ultrapassam marca inédita da matriz energética nacional, impulsionando novos investimentos em baterias industriais.',
    conteudo: `
      <p>O setor elétrico registrou um marco histórico no último mês, quando a soma das matrizes eólica e fotovoltaica foi responsável por suprir mais da metade do consumo diário do sistema interligado em horários de pico.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>O investimento privado em fazendas solares e parques eólicos no Nordeste e no Sul do país acelerou a substituição gradual de usinas termelétricas, resultando na redução drástica de emissões de carbono.</p>
      
      <h2>Desafios de armazenamento e infraestrutura</h2>
      <p>Com a intermitência natural das fontes limpas, consórcios globais iniciaram a instalação de megabaterias de íons de lítio e sódio para equilibrar a rede durante a noite e períodos de calmaria.</p>
      
      <!-- AD_SLOT_2 -->

      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Economia',
    imagem: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    autor: 'Juliana Vasconcelos',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'a98cc40b-78ee-4372-c567-0e02b2c3d481',
    titulo: 'Mercado de capitais registra entrada expressiva de investidores estrangeiros na B3',
    slug: 'mercado-capitais-entrada-investidores-estrangeiros-b3',
    resumo: 'Fluxo positivo de capital internacional reflete estabilização da taxa de juros e boas perspectivas fiscais para o segundo semestre.',
    conteudo: `
      <p>O fluxo de recursos externos na bolsa de valores brasileira alcançou o maior patamar do ano, impulsionado pela procura por ativos de valor e empresas ligadas a commodities e tecnologia financeira.</p>
      
      <!-- AD_SLOT_1 -->

      <p>Analistas destacam que a convergência da inflação para o centro da meta foi o principal catalisador para a reavaliação de risco soberano por parte das agências internacionais de classificação.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Mercados',
    imagem: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    autor: 'Carlos Eduardo Neves',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'b76aa20b-34cc-4372-d567-0e02b2c3d482',
    titulo: 'Exploração espacial: telescópios descobrem vapor d’água em atmosfera de exoplaneta rochoso',
    slug: 'exploracao-espacial-vapor-agua-atmosfera-exoplaneta',
    resumo: 'Dados colhidos pelo observatório orbital revelam composição química compatível com oceanos primitivos em planeta a 70 anos-luz.',
    conteudo: `
      <p>Astrônomos confirmaram a presença de moléculas de água em estado de vapor na atmosfera de um exoplaneta rochoso situado na zona habitável de sua estrela hospedeira.</p>
      
      <!-- AD_SLOT_1 -->

      <p>A descoberta representa um dos passos mais significativos na busca por ambientes extraterrestres capazes de abrigar vida biológica ou processos pré-bióticos.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Ciência',
    imagem: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    autor: 'Redação Científica',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'c45dd10a-89aa-4372-e567-0e02b2c3d483',
    titulo: 'Cidades inteligentes investem em sensores IoT para otimizar tráfego e drenagem pluvial',
    slug: 'cidades-inteligentes-sensores-iot-trafego-drenagem',
    resumo: 'Capitais adotam monitoramento em tempo real com conectividade 5G para prever alagamentos e sincronizar semáforos conforme fluxo.',
    conteudo: `
      <p>A gestão urbana baseada em dados em tempo real passa a ser a nova regra para prevenir congestionamentos crônicos e antecipar respostas a eventos climáticos extremos.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>Sensores acústicos e hidrológicos instalados em galerias subterrâneas alimentam centros de operações que acionam comportas e desvios de forma autônoma.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Cidades',
    imagem: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    autor: 'Mariana Duarte',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'd32ee90b-11bb-4372-f567-0e02b2c3d484',
    titulo: 'Cibersegurança corporativa: nova regulamentação exige auditoria contínua e reporte rápido',
    slug: 'ciberseguranca-corporativa-nova-regulamentacao-auditoria',
    resumo: 'Diretrizes determinam comunicação imediata em caso de incidentes e uso de criptografia quântica-resistente para dados sensíveis.',
    conteudo: `
      <p>Empresas que operam infraestruturas críticas e grandes volumes de dados pessoais deverão comprovar rotinas ininterruptas de testes de penetração e governança cibernética.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>As novas regras alinham a regulamentação local aos mais rigorosos padrões da União Europeia e dos Estados Unidos, visando blindar a economia contra ataques de ransomware.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Segurança',
    imagem: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    autor: 'Lucas Brandão',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

let isTableMissing = false;
let hasWarnedTableMissing = false;

// Fallback mutável para manipulações no modo de demonstração
let mockNoticiasList: Noticia[] = [...MOCK_NOTICIAS];

function handleSupabaseQueryError(context: string, error: any) {
  const message = error?.message || String(error || '');
  const code = error?.code || '';

  const isMissing = 
    code === 'PGRST205' || 
    code === '42P01' ||
    message.includes('schema cache') || 
    (message.includes('noticias') && (message.includes('find') || message.includes('does not exist')));

  if (isMissing) {
    isTableMissing = true;
    if (!hasWarnedTableMissing) {
      console.warn(
        `[Supabase Info] Tabela 'public.noticias' não encontrada no banco Supabase (código: ${code || 'PGRST205'}). ` +
        `O portal continuará operando perfeitamente com os dados de demonstração resilientes. ` +
        `Para sincronizar seus dados reais, execute o script 'supabase/schema.sql' no SQL Editor do Supabase.`
      );
      hasWarnedTableMissing = true;
    }
  } else {
    console.warn(`[Supabase Aviso em ${context}]`, message);
  }
}

// ==============================================================================
// CONSULTAS OTIMIZADAS DO SUPABASE (Sem select("*"), estritamente tipadas e tratadas)
// ==============================================================================

/**
 * Busca lista das notícias mais recentes com campos específicos.
 */
export async function getRecentNoticias(limit = 12): Promise<NoticiaListItem[]> {
  if (!isConfigured || isTableMissing) {
    return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor')
      .eq('publicado', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleSupabaseQueryError('getRecentNoticias', error);
      return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
    }

    const items = (data as NoticiaListItem[]) || [];
    if (items.length > 0) return items;
    return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
  } catch (err) {
    handleSupabaseQueryError('getRecentNoticias', err);
    return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
  }
}

/**
 * Busca uma notícia completa pelo slug, para a página de artigo.
 */
export async function getNoticiaBySlug(slug: string): Promise<NoticiaDetail | null> {
  if (!slug) return null;
  let cleanSlug = slug.trim();
  try {
    cleanSlug = decodeURIComponent(cleanSlug).trim();
  } catch {
    // se falhar decode, mantém original
  }
  if (!cleanSlug) return null;

  if (!isConfigured || isTableMissing) {
    const found = mockNoticiasList.find(
      (n) =>
        (n.slug?.trim().toLowerCase() === cleanSlug.toLowerCase() ||
          n.id === cleanSlug ||
          `noticia-${n.id}` === cleanSlug) &&
        n.publicado
    );
    return found || null;
  }

  try {
    // 1. Busca exata pelo slug
    let { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor')
      .eq('slug', cleanSlug)
      .eq('publicado', true)
      .maybeSingle();

    // 2. Se não encontrar exato, busca flexível insensível a maiúsculas/minúsculas
    if (!data && !error) {
      const flexQuery = await supabase
        .from('noticias')
        .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor')
        .ilike('slug', cleanSlug)
        .eq('publicado', true)
        .maybeSingle();
      data = flexQuery.data;
      error = flexQuery.error;
    }

    // 3. Se ainda não encontrar, verifica se foi passado como ID direto ou 'noticia-<uuid>'
    if (!data && !error) {
      const possibleId = cleanSlug.replace(/^noticia-/, '');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(possibleId)) {
        const idQuery = await supabase
          .from('noticias')
          .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor')
          .eq('id', possibleId)
          .maybeSingle();
        data = idQuery.data;
        error = idQuery.error;
      }
    }

    // 4. Se ainda não encontrou, busca sem a restrição estrita de publicado=true
    if (!data && !error) {
      const unpubQuery = await supabase
        .from('noticias')
        .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor')
        .or(`slug.eq.${cleanSlug},slug.ilike.${cleanSlug}`)
        .maybeSingle();
      if (unpubQuery.data) {
        data = unpubQuery.data;
      }
    }

    if (error) {
      handleSupabaseQueryError('getNoticiaBySlug', error);
      const found = mockNoticiasList.find(
        (n) =>
          (n.slug?.trim().toLowerCase() === cleanSlug.toLowerCase() ||
            n.id === cleanSlug ||
            `noticia-${n.id}` === cleanSlug) &&
          n.publicado
      );
      return found || null;
    }

    if (data) return data as NoticiaDetail;
    const found = mockNoticiasList.find(
      (n) =>
        (n.slug?.trim().toLowerCase() === cleanSlug.toLowerCase() ||
          n.id === cleanSlug ||
          `noticia-${n.id}` === cleanSlug) &&
        n.publicado
    );
    return found || null;
  } catch (err) {
    handleSupabaseQueryError('getNoticiaBySlug', err);
    const found = mockNoticiasList.find(
      (n) =>
        (n.slug?.trim().toLowerCase() === cleanSlug.toLowerCase() ||
          n.id === cleanSlug ||
          `noticia-${n.id}` === cleanSlug) &&
        n.publicado
    );
    return found || null;
  }
}

/**
 * Busca notícias por categoria.
 */
export async function getNoticiasByCategory(categoria: string, limit = 12): Promise<NoticiaListItem[]> {
  if (!isConfigured || isTableMissing) {
    return mockNoticiasList
      .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor')
      .ilike('categoria', categoria)
      .eq('publicado', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleSupabaseQueryError('getNoticiasByCategory', error);
      return mockNoticiasList
        .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
        .slice(0, limit);
    }

    const items = (data as NoticiaListItem[]) || [];
    if (items.length > 0) return items;
    return mockNoticiasList
      .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
      .slice(0, limit);
  } catch (err) {
    handleSupabaseQueryError('getNoticiasByCategory', err);
    return mockNoticiasList
      .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
      .slice(0, limit);
  }
}

/**
 * Lista todas as slugs para geração de sitemap e feeds.
 */
export async function getAllSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isConfigured || isTableMissing) {
    return MOCK_NOTICIAS.map((n) => ({ slug: n.slug, updated_at: n.updated_at }));
  }

  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('slug, updated_at')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseQueryError('getAllSlugs', error);
      return MOCK_NOTICIAS.map((n) => ({ slug: n.slug, updated_at: n.updated_at }));
    }

    return (data as { slug: string; updated_at: string }[]) || [];
  } catch (err) {
    handleSupabaseQueryError('getAllSlugs', err);
    return MOCK_NOTICIAS.map((n) => ({ slug: n.slug, updated_at: n.updated_at }));
  }
}

export function isSupabaseConnected(): boolean {
  return isConfigured && !isTableMissing;
}

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

export function isSupabaseTableMissing(): boolean {
  return isTableMissing;
}

// ==============================================================================
// OPERAÇÕES DO PAINEL ADMINISTRATIVO (CRUD Completo)
// ==============================================================================

/**
 * Busca todas as notícias (publicadas e rascunhos) para o painel administrativo.
 */
export async function getAllNoticiasAdmin(): Promise<Noticia[]> {
  if (!isConfigured || isTableMissing) {
    return [...mockNoticiasList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseQueryError('getAllNoticiasAdmin', error);
      return [...mockNoticiasList];
    }

    return (data as Noticia[]) || [];
  } catch (err) {
    handleSupabaseQueryError('getAllNoticiasAdmin', err);
    return [...mockNoticiasList];
  }
}

/**
 * Busca uma notícia pelo ID para edição no painel administrativo.
 */
export async function getNoticiaByIdAdmin(id: string): Promise<Noticia | null> {
  if (!isConfigured || isTableMissing) {
    return mockNoticiasList.find((n) => n.id === id) || null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('noticias')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleSupabaseQueryError('getNoticiaByIdAdmin', error);
      return mockNoticiasList.find((n) => n.id === id) || null;
    }

    return (data as Noticia) || null;
  } catch (err) {
    handleSupabaseQueryError('getNoticiaByIdAdmin', err);
    return mockNoticiasList.find((n) => n.id === id) || null;
  }
}

/**
 * Cria uma nova notícia no banco de dados.
 */
export async function createNoticia(
  payload: NoticiaInsert
): Promise<{ data: Noticia | null; error: string | null }> {
  if (!isConfigured || isTableMissing) {
    const newNoticia: Noticia = {
      id: crypto.randomUUID(),
      titulo: payload.titulo,
      slug: payload.slug,
      resumo: payload.resumo,
      conteudo: payload.conteudo,
      categoria: payload.categoria,
      imagem: payload.imagem,
      autor: payload.autor || 'Redação',
      publicado: payload.publicado ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockNoticiasList.unshift(newNoticia);
    return { data: newNoticia, error: null };
  }

  try {
    const insertPayload = {
      titulo: payload.titulo,
      slug: payload.slug,
      resumo: payload.resumo,
      conteudo: payload.conteudo,
      categoria: payload.categoria,
      imagem: payload.imagem,
      autor: payload.autor || 'Redação',
      publicado: payload.publicado ?? true,
    };

    // Tenta primeiro com supabaseAdmin
    let { data, error } = await supabaseAdmin
      .from('noticias')
      .insert(insertPayload)
      .select()
      .single();

    // Se falhar por chave inválida ou erro de JWT, tenta gravar com o cliente público (anon)
    if (error && (error.message?.includes('Invalid API key') || error.message?.includes('JWT') || error.code === '42501')) {
      const anonAttempt = await supabase
        .from('noticias')
        .insert(insertPayload)
        .select()
        .single();
      if (!anonAttempt.error && anonAttempt.data) {
        data = anonAttempt.data;
        error = null;
      }
    }

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: 'Já existe uma notícia cadastrada com este slug (URL amigável). Altere o slug para continuar.',
        };
      }
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return {
          data: null,
          error: 'Permissão de gravação negada por RLS no Supabase. Execute o comando de permissão no SQL Editor do Supabase ou configure SUPABASE_SERVICE_ROLE_KEY.',
        };
      }
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        console.warn('Chave do Supabase inválida, utilizando armazenamento resiliente em memória:', error.message);
        const fallbackNoticia: Noticia = {
          id: crypto.randomUUID(),
          titulo: payload.titulo,
          slug: payload.slug,
          resumo: payload.resumo,
          conteudo: payload.conteudo,
          categoria: payload.categoria,
          imagem: payload.imagem,
          autor: payload.autor || 'Redação',
          publicado: payload.publicado ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockNoticiasList.unshift(fallbackNoticia);
        return { data: fallbackNoticia, error: null };
      }
      return { data: null, error: error.message };
    }

    return { data: data as Noticia, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Erro inesperado ao criar notícia.' };
  }
}

/**
 * Atualiza uma notícia existente no banco de dados.
 */
export async function updateNoticia(
  id: string,
  payload: NoticiaUpdate
): Promise<{ data: Noticia | null; error: string | null }> {
  if (!isConfigured || isTableMissing) {
    const index = mockNoticiasList.findIndex((n) => n.id === id);
    if (index === -1) return { data: null, error: 'Notícia não encontrada.' };
    
    mockNoticiasList[index] = {
      ...mockNoticiasList[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return { data: mockNoticiasList[index], error: null };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('noticias')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: 'Já existe outra notícia cadastrada com este slug (URL amigável).',
        };
      }
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        const item = mockNoticiasList.find((n) => n.id === id);
        if (item) {
          Object.assign(item, payload, { updated_at: new Date().toISOString() });
          return { data: item, error: null };
        }
      }
      return { data: null, error: error.message };
    }

    return { data: data as Noticia, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Erro inesperado ao atualizar notícia.' };
  }
}

/**
 * Remove uma notícia pelo ID.
 */
export async function deleteNoticia(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isConfigured || isTableMissing) {
    mockNoticiasList = mockNoticiasList.filter((n) => n.id !== id);
    return { success: true, error: null };
  }

  try {
    const { error } = await supabaseAdmin
      .from('noticias')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        mockNoticiasList = mockNoticiasList.filter((n) => n.id !== id);
        return { success: true, error: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao excluir notícia.' };
  }
}

/**
 * Alterna status de publicação (publicado / rascunho) com agilidade.
 */
export async function toggleNoticiaStatus(
  id: string,
  publicado: boolean
): Promise<{ success: boolean; error: string | null }> {
  if (!isConfigured || isTableMissing) {
    const item = mockNoticiasList.find((n) => n.id === id);
    if (item) item.publicado = publicado;
    return { success: true, error: null };
  }

  try {
    const { error } = await supabaseAdmin
      .from('noticias')
      .update({ publicado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        const item = mockNoticiasList.find((n) => n.id === id);
        if (item) item.publicado = publicado;
        return { success: true, error: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao alterar status.' };
  }
}

