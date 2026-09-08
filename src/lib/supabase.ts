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

// Validação estrita do token service role: se for URL do painel ou inválido, ignora com segurança
function isValidServiceKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.startsWith('http') || trimmed.includes('supabase.com') || trimmed.includes(' ')) return false;
  return trimmed.startsWith('eyJ') || trimmed.startsWith('sb_secret_') || trimmed.length > 30;
}

const supabaseServiceKey = isValidServiceKey(rawServiceKey) ? rawServiceKey.trim() : '';

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

// Cliente com Service Role para o painel de admin e SSR (ignora restrições de RLS se configurado)
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

/**
 * Retorna o melhor cliente para consultas de leitura no servidor SSR:
 * Se a chave service_role estiver configurada e válida, usa supabaseAdmin para evitar bloqueios de RLS.
 * Caso contrário, utiliza o cliente padrão anon.
 */
export function getReadClient() {
  if (supabaseServiceKey) {
    return supabaseAdmin;
  }
  return supabase;
}

function isApiKeyError(error: any): boolean {
  const msg = error?.message || String(error || '');
  return msg.includes('Invalid API key') || msg.includes('JWT') || msg.includes('apiKey');
}


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
  {
    id: 'a91ff20c-33dd-4172-e123-0e02b2c3d485',
    titulo: 'Indústria nacional acelera investimentos em automação pesada e produção sustentável',
    slug: 'industria-nacional-investimentos-automacao-sustentabilidade',
    resumo: 'Fábricas brasileiras modernizam linhas de montagem com robótica avançada e redução histórica no consumo hídrico e energético.',
    conteudo: '<p>A modernização do parque industrial nacional atinge novos patamares de eficiência com a implementação de robôs colaborativos e inteligência industrial.</p>',
    categoria: 'Economia',
    imagem: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
    autor: 'Paulo Nogueira',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'b82ee30d-44ee-4272-f234-0e02b2c3d486',
    titulo: 'Vagas no setor de tecnologia e infraestrutura crescem 28% no terceiro trimestre',
    slug: 'vagas-setor-tecnologia-infraestrutura-crescimento-trimestre',
    resumo: 'Levantamento revela alta demanda por engenheiros de dados, especialistas em energias renováveis e técnicos especializados.',
    conteudo: '<p>O mercado de trabalho para setores estratégicos continua aquecido, impulsionado por grandes aportes em conectividade e infraestrutura limpa.</p>',
    categoria: 'Mercados',
    imagem: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    autor: 'Camila Silveira',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'c73dd40e-55ff-4372-a345-0e02b2c3d487',
    titulo: 'Cientistas desenvolvem novo supercondutor que opera em condições menos extremas',
    slug: 'cientistas-supercondutor-condicoes-menos-extremas',
    resumo: 'Descoberta promete revolucionar a transmissão de eletricidade sem perdas e baratear a tecnologia de trens magnéticos.',
    conteudo: '<p>Equipe internacional de pesquisadores apresenta material composto capaz de conduzir eletricidade com resistência zero a temperaturas significativamente mais acessíveis.</p>',
    categoria: 'Ciência',
    imagem: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop',
    autor: 'Dra. Helena Meirelles',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'd64cc50f-66aa-4472-b456-0e02b2c3d488',
    titulo: 'Mobilidade urbana: cidades brasileiras testam frotas 100% elétricas para transporte coletivo',
    slug: 'mobilidade-urbana-frotas-eletricas-transporte-coletivo',
    resumo: 'Ônibus elétricos com recarga ultrarrápida entram em operação piloto reduzindo ruído e emissões em corredores metropolitanos.',
    conteudo: '<p>Capitais iniciam a substituição progressiva de veículos a diesel por modelos elétricos com autonomia para turnos completos de circulação.</p>',
    categoria: 'Cidades',
    imagem: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
    autor: 'Roberto Alencar',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
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
  if (!isConfigured) {
    return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
  }

  const primaryClient = getReadClient();
  try {
    let { data, error } = await primaryClient
      .from('noticias')
      .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor, publicado')
      .or('publicado.eq.true,publicado.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Se falhou por erro de API key ou permissão, tenta com o outro cliente
    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor, publicado')
          .or('publicado.eq.true,publicado.is.null')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getRecentNoticias', error);
      return mockNoticiasList.filter((n) => n.publicado).slice(0, limit);
    }

    // Sucesso: reseta a flag de ausência de tabela
    isTableMissing = false;

    const items = (data as NoticiaListItem[]) || [];
    if (items.length > 0) return items;

    // Se o banco existe e está conectado mas não há notícias publicadas cadastradas ainda
    return [];
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

  if (!isConfigured) {
    const found = mockNoticiasList.find(
      (n) =>
        (n.slug?.trim().toLowerCase() === cleanSlug.toLowerCase() ||
          n.id === cleanSlug ||
          `noticia-${n.id}` === cleanSlug) &&
        n.publicado
    );
    return found || null;
  }

  const primaryClient = getReadClient();
  try {
    // 1. Busca exata pelo slug
    let { data, error } = await primaryClient
      .from('noticias')
      .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor, publicado')
      .eq('slug', cleanSlug)
      .or('publicado.eq.true,publicado.is.null')
      .maybeSingle();

    // Fallback para cliente alternativo em caso de falha de credencial/permissão
    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor, publicado')
          .eq('slug', cleanSlug)
          .or('publicado.eq.true,publicado.is.null')
          .maybeSingle();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    // 2. Se não encontrar exato, busca flexível insensível a maiúsculas/minúsculas
    if (!data && !error) {
      const flexQuery = await primaryClient
        .from('noticias')
        .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor, publicado')
        .ilike('slug', cleanSlug)
        .or('publicado.eq.true,publicado.is.null')
        .maybeSingle();
      data = flexQuery.data;
      error = flexQuery.error;
    }

    // 3. Se ainda não encontrar, verifica se foi passado como ID direto ou 'noticia-<uuid>'
    if (!data && !error) {
      const possibleId = cleanSlug.replace(/^noticia-/, '');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(possibleId)) {
        const idQuery = await primaryClient
          .from('noticias')
          .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor, publicado')
          .eq('id', possibleId)
          .maybeSingle();
        data = idQuery.data;
        error = idQuery.error;
      }
    }

    // 4. Se ainda não encontrou, busca sem a restrição de publicado
    if (!data && !error) {
      const unpubQuery = await primaryClient
        .from('noticias')
        .select('id, titulo, slug, resumo, conteudo, categoria, imagem, created_at, autor, publicado')
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

    if (data) {
      isTableMissing = false;
      return data as NoticiaDetail;
    }

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
  if (!isConfigured) {
    return mockNoticiasList
      .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
      .slice(0, limit);
  }

  const primaryClient = getReadClient();
  try {
    let { data, error } = await primaryClient
      .from('noticias')
      .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor, publicado')
      .ilike('categoria', categoria)
      .or('publicado.eq.true,publicado.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor, publicado')
          .ilike('categoria', categoria)
          .or('publicado.eq.true,publicado.is.null')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getNoticiasByCategory', error);
      return mockNoticiasList
        .filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase() && n.publicado)
        .slice(0, limit);
    }

    isTableMissing = false;
    const items = (data as NoticiaListItem[]) || [];
    if (items.length > 0) return items;

    return [];
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
  if (!isConfigured) {
    return MOCK_NOTICIAS.map((n) => ({ slug: n.slug, updated_at: n.updated_at }));
  }

  const primaryClient = getReadClient();
  try {
    let { data, error } = await primaryClient
      .from('noticias')
      .select('slug, updated_at, publicado')
      .or('publicado.eq.true,publicado.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('slug, updated_at, publicado')
          .or('publicado.eq.true,publicado.is.null')
          .order('created_at', { ascending: false });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getAllSlugs', error);
      return MOCK_NOTICIAS.map((n) => ({ slug: n.slug, updated_at: n.updated_at }));
    }

    isTableMissing = false;
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
  if (!isConfigured) {
    return [...mockNoticiasList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const primaryClient = getReadClient();
  try {
    let { data, error } = await primaryClient
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getAllNoticiasAdmin', error);
      return [...mockNoticiasList];
    }

    isTableMissing = false;
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
  if (!isConfigured) {
    return mockNoticiasList.find((n) => n.id === id) || null;
  }

  const primaryClient = getReadClient();
  try {
    let { data, error } = await primaryClient
      .from('noticias')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getNoticiaByIdAdmin', error);
      return mockNoticiasList.find((n) => n.id === id) || null;
    }

    isTableMissing = false;
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
  if (!isConfigured) {
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

    // Tenta primeiro com supabaseAdmin (ou getReadClient)
    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    let { data, error } = await primaryClient
      .from('noticias')
      .insert(insertPayload)
      .select()
      .single();

    // Se falhar no admin por chave ou RLS, tenta com o cliente anon
    if (error && primaryClient !== supabase) {
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
          error: 'Permissão de gravação negada por RLS no Supabase. Execute o script supabase/schema.sql ou desabilite RLS para permitir inserções.',
        };
      }
      return { data: null, error: error.message };
    }

    isTableMissing = false;
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
  if (!isConfigured) {
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
    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    let { data, error } = await primaryClient
      .from('noticias')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error && primaryClient !== supabase) {
      const anonAttempt = await supabase
        .from('noticias')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
          error: 'Já existe outra notícia cadastrada com este slug (URL amigável).',
        };
      }
      return { data: null, error: error.message };
    }

    isTableMissing = false;
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
  if (!isConfigured) {
    mockNoticiasList = mockNoticiasList.filter((n) => n.id !== id);
    return { success: true, error: null };
  }

  try {
    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    let { error } = await primaryClient
      .from('noticias')
      .delete()
      .eq('id', id);

    if (error && primaryClient !== supabase) {
      const anonAttempt = await supabase
        .from('noticias')
        .delete()
        .eq('id', id);
      if (!anonAttempt.error) {
        error = null;
      }
    }

    if (error) {
      return { success: false, error: error.message };
    }

    isTableMissing = false;
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
  if (!isConfigured) {
    const item = mockNoticiasList.find((n) => n.id === id);
    if (item) item.publicado = publicado;
    return { success: true, error: null };
  }

  try {
    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    let { error } = await primaryClient
      .from('noticias')
      .update({ publicado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error && primaryClient !== supabase) {
      const anonAttempt = await supabase
        .from('noticias')
        .update({ publicado, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!anonAttempt.error) {
        error = null;
      }
    }

    if (error) {
      return { success: false, error: error.message };
    }

    isTableMissing = false;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao alterar status.' };
  }
}

