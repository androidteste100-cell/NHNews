import { createClient } from '@supabase/supabase-js';
import type { Database, Noticia, NoticiaListItem, NoticiaDetail, NoticiaInsert, NoticiaUpdate, CategorySlug } from '../types/database.types';
import { getCategoryStyle, normalizeCategorySlug } from './categories';

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
    titulo: 'Operação integrada das forças de segurança desarticula rede interestadual de estelionato digital',
    slug: 'operacao-seguranca-desarticula-rede-estelionato-digital',
    resumo: 'Investigação coordenada cumpre dezenas de mandados com apreensão de equipamentos e bloqueio de contas utilizadas em golpes financeiros.',
    conteudo: `
      <p class="lead">Uma megaoperação deflagrada na manhã de hoje mobilizou policiais civis e militares no combate a uma organização criminosa especializada em fraudes bancárias eletrônicas.</p>
      
      <p>As apurações preliminares revelaram que o esquema desviava recursos através de páginas clonadas de instituições de crédito e falsas centrais telefônicas. Foram cumpridos mandados de busca, apreensão e prisões preventivas.</p>
      
      <!-- AD_SLOT_1 -->

      <h2>Estratégia de investigação cibernética</h2>
      <p>O setor de inteligência policial rastreou os fluxos de dados e as carteiras virtuais de criptoativos para mapear a hierarquia financeira do grupo. O delegado responsável destacou a integração entre os órgãos estaduais como fator decisivo para o sucesso da ação.</p>
      
      <blockquote>
        "O cerco ao crime organizado digital exige tecnologia de ponta e resposta rápida para garantir a proteção do cidadão e do comércio", enfatizou a autoridade policial.
      </blockquote>

      <!-- AD_SLOT_2 -->

      <h2>Ações preventivas e canais de denúncia</h2>
      <p>A corporação orienta a população a verificar a autenticidade de links e canais de contato antes de fornecer dados bancários, disponibilizando linhas diretas para registro de ocorrências.</p>

      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Polícia',
    category_slug: 'policia',
    imagem: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    autor: 'Redação Policial',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'e12bc30a-28dc-4372-b567-0e02b2c3d480',
    titulo: 'Orla de Maceió recebe plano de modernização urbana com ciclovias ampliadas e tecnologia',
    slug: 'orla-maceio-plano-modernizacao-urbana-ciclovias',
    resumo: 'Intervenções abrangem sinalização inteligente, nova iluminação em LED e valorização dos espaços de convivência da orla marítima.',
    conteudo: `
      <p>A orla marítima de Maceió, referência em beleza natural e turismo nacional, passa por uma ampla revitalização com foco em sustentabilidade e mobilidade ativa.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>O projeto contempla a ampliação de ciclovias integradas, instalação de postos de salvamento modernizados e novo paisagismo com espécies nativas da flora litorânea.</p>
      
      <h2>Impacto para o turismo e moradores</h2>
      <p>Além de fomentar a economia criativa e os quiosques gastronômicos, as melhorias ampliam a segurança com monitoramento por câmeras de alta definição conectadas à central urbana.</p>
      
      <!-- AD_SLOT_2 -->

      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Maceió',
    category_slug: 'maceio',
    imagem: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    autor: 'Mariana Duarte',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'a98cc40b-78ee-4372-c567-0e02b2c3d481',
    titulo: 'Obras de saneamento e infraestrutura hídrica avançam em 15 municípios do interior',
    slug: 'obras-saneamento-infraestrutura-hidrica-interior',
    resumo: 'Investimentos estruturantes levam água tratada e pavimentação a comunidades rurais e centros urbanos do Agreste e Sertão.',
    conteudo: `
      <p>As frentes de trabalho para universalização do saneamento e ampliação de adutoras ganharam ritmo acelerado em diversas regiões do interior do estado.</p>
      
      <!-- AD_SLOT_1 -->

      <p>O cronograma prevê a entrega de reservatórios centrais, estações de tratamento de esgoto e recuperação de vias vicinais essenciais para o escoamento da produção agrícola familiar.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Interior',
    category_slug: 'interior',
    imagem: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    autor: 'Carlos Eduardo Neves',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'b76aa20b-34cc-4372-d567-0e02b2c3d482',
    titulo: 'Assembleia Legislativa aprova projeto de incentivo ao microcrédito e inovação produtiva',
    slug: 'assembleia-legislativa-aprova-projeto-incentivo-microcredito',
    resumo: 'Proposta estabelece desonerações tributárias e linhas de crédito facilitadas para pequenos e médios empreendedores locais.',
    conteudo: `
      <p>Os parlamentares aprovaram por unanimidade o pacote econômico que fomenta novas empresas, startups e cooperativas de desenvolvimento regional.</p>
      
      <!-- AD_SLOT_1 -->

      <p>A medida prevê ainda a criação de fundos garantidores para jovens empreendedores e incentivos fiscais para polos industriais do interior e da região metropolitana.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Política',
    category_slug: 'politica',
    imagem: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    autor: 'Paulo Nogueira',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'c45dd10a-89aa-4372-e567-0e02b2c3d483',
    titulo: 'Transição energética e agronegócio impulsionam crescimento do PIB no segundo trimestre',
    slug: 'transicao-energetica-recorde-geracao-solar-eolica',
    resumo: 'Geração de energia solar, exportação de grãos e turismo batem recordes históricos de faturamento e geração de vagas com carteira assinada.',
    conteudo: `
      <p>O setor produtivo registrou expansão consistente, impulsionado pela entrada em operação de novos parques solares e investimentos em logística de exportação.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>Analistas econômicos destacam a consolidação de projetos sustentáveis como o principal atrativo para capitais institucionais e investidores privados internacionais.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Economia',
    category_slug: 'economia',
    imagem: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    autor: 'Juliana Vasconcelos',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'd32ee90b-11bb-4372-f567-0e02b2c3d484',
    titulo: 'Futebol alagoano: rodada decisiva define classificados para a grande final do campeonato',
    slug: 'futebol-alagoano-rodada-decisiva-final-campeonato',
    resumo: 'Estádios lotados e disputas emocionantes marcam as semifinais com grande presença das torcidas organizadas e cobertura completa.',
    conteudo: `
      <p>O fim de semana foi de fortes emoções nos gramados com a definição dos finalistas que disputarão a taça estadual e as vagas em torneios nacionais.</p>
      
      <!-- AD_SLOT_1 -->
      
      <p>Os técnicos avaliaram o desempenho tático e físico das equipes, projetando confrontos disputados lance a lance na decisão pelo título da temporada.</p>
      
      <!-- AD_SLOT_2 -->
      <!-- AD_SLOT_FOOTER -->
    `,
    categoria: 'Esporte',
    category_slug: 'esporte',
    imagem: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    autor: 'Roberto Alencar',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'a91ff20c-33dd-4172-e123-0e02b2c3d485',
    titulo: 'Cúpula internacional do clima firma compromissos globais para preservação dos oceanos',
    slug: 'cupula-internacional-clima-compromissos-oceanos',
    resumo: 'Mais de 80 países acordam diretrizes vinculantes para erradicação de plásticos marítimos e proteção a recifes de corais.',
    conteudo: '<p>Líderes mundiais reunidos na conferência ambiental ratificaram tratados multilaterais voltados ao financiamento climático e à recuperação dos ecossistemas costeiros em escala planetária.</p>',
    categoria: 'Mundo',
    category_slug: 'mundo',
    imagem: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    autor: 'Lucas Brandão',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'f91aa20c-55aa-4372-c123-0e02b2c3d490',
    titulo: 'Governo federal lança plano nacional para acelerar ferrovias e infraestrutura',
    slug: 'governo-federal-lanca-plano-nacional-ferrovias-infraestrutura',
    resumo: 'Programa prevê investimentos prioritários em transportes, modernização de portos e integração logística entre estados.',
    conteudo: '<p>O Ministério dos Transportes apresentou um plano estratégico com metas de curto e médio prazo para ampliar a malha ferroviária e baratear o escoamento produtivo nacional.</p>',
    categoria: 'Brasil',
    category_slug: 'brasil',
    imagem: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    autor: 'Redação Nacional',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'f92bb30c-66bb-4372-c234-0e02b2c3d491',
    titulo: 'Congresso aprova marco regulatório para estímulo à inovação e transição energética',
    slug: 'congresso-aprova-marco-regulatorio-inovacao-transicao-energetica',
    resumo: 'Nova legislação estabelece incentivos para energia solar, eólica offshore e descarbonização dos setores industriais.',
    conteudo: '<p>Em sessão conjunta, senadores e deputados aprovaram diretrizes fiscais e ambientais para alavancar investimentos em fontes renováveis e novas tecnologias sustentáveis no país.</p>',
    categoria: 'Brasil',
    category_slug: 'brasil',
    imagem: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop',
    autor: 'Brasília em Foco',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    id: 'f93cc40c-77cc-4372-c345-0e02b2c3d492',
    titulo: 'Balança comercial brasileira registra superávit histórico impulsionada por exportações',
    slug: 'balanca-comercial-brasileira-registra-superavit-historico',
    resumo: 'Destaques para o agronegócio sustentável, mineração e bens manufaturados, consolidando novos parceiros comerciais.',
    conteudo: '<p>Os números consolidados do comércio exterior apontam para um saldo comercial recorde no acumulado dos últimos doze meses, impulsionando reservas internacionais e a atividade econômica.</p>',
    categoria: 'Brasil',
    category_slug: 'brasil',
    imagem: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    autor: 'Agência Brasil',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: 'b82ee30d-44ee-4272-f234-0e02b2c3d486',
    titulo: 'Festival de Arte e Tradições Populares reúne mestres da cultura em mostra histórica',
    slug: 'festival-arte-tradicoes-populares-mostra-historica',
    resumo: 'Apresentações de folguedos, mostras de cinema documental e feira de artesanato atraem pesquisadores e público de todo o país.',
    conteudo: '<p>A celebração da identidade cultural e da memória viva reuniu dezenas de grupos tradicionais com oficinas interativas e espetáculos abertos ao público em praça histórica.</p>',
    categoria: 'Cultura, Lazer & Variedades',
    category_slug: 'cultura-lazer-variedades',
    imagem: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1200&auto=format&fit=crop',
    autor: 'Camila Silveira',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'c73dd40e-55ff-4372-a345-0e02b2c3d487',
    titulo: 'Roteiro de fim de semana: gastronomia praiana, feiras criativas e passeios de ecoturismo',
    slug: 'roteiro-fim-semana-gastronomia-feiras-ecoturismo',
    resumo: 'Confira as melhores opções de lazer, restaurantes estrelados, passeios de catamarã e eventos culturais para toda a família.',
    conteudo: '<p>Com a chegada do fim de semana, selecionamos os destaques do cenário gastronômico e de entretenimento com opções imperdíveis para relaxar e aproveitar o litoral e as lagoas.</p>',
    categoria: 'Cultura, Lazer & Variedades',
    category_slug: 'cultura-lazer-variedades',
    imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    autor: 'Redação Variedades',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
  },
  {
    id: 'd64cc50f-66aa-4472-b456-0e02b2c3d488',
    titulo: 'Polícia Rodoviária intensifica fiscalização preventiva e tecnologia nas rodovias',
    slug: 'policia-rodoviaria-intensifica-fiscalizacao-rodovias',
    resumo: 'Radares móveis e etilômetros de última geração reforçam a segurança nos principais corredores de acesso e entroncamentos.',
    conteudo: '<p>Ações coordenadas de patrulhamento tático resultaram na redução de acidentes e no combate contínuo ao transporte clandestino e ao tráfico de ilícitos.</p>',
    categoria: 'Polícia',
    category_slug: 'policia',
    imagem: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
    autor: 'Redação Policial',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'e75dd60a-77bb-4572-c567-0e02b2c3d489',
    titulo: 'Maceió é eleita um dos destinos turísticos mais procurados do Nordeste brasileiro',
    slug: 'maceio-eleita-destino-turistico-mais-procurado',
    resumo: 'Pesquisa da hotelaria aponta taxa de ocupação superior a 90% e consolidação de eventos gastronômicos internacionais na orla.',
    conteudo: '<p>O reconhecimento turístico reflete os investimentos contínuos na infraestrutura urbana, limpeza pública exemplar e promoção dos atrativos naturais em feiras mundiais de turismo.</p>',
    categoria: 'Maceió',
    category_slug: 'maceio',
    imagem: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1200&auto=format&fit=crop',
    autor: 'Mariana Duarte',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'f86ee70b-88cc-4672-d678-0e02b2c3d490',
    titulo: 'Exportações do agronegócio e cooperativas do interior crescem 18% no semestre',
    slug: 'exportacoes-agronegocio-cooperativas-interior-crescem',
    resumo: 'Cooperativas de cana, laticínios e fruticultura irrigada consolidam novos mercados na Europa e Ásia.',
    conteudo: '<p>A valorização da agricultura familiar e a modernização dos processos de embalagem e conservação garantem novos patamares de produtividade e rentabilidade no campo.</p>',
    categoria: 'Economia',
    category_slug: 'economia',
    imagem: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
    autor: 'Carlos Eduardo Neves',
    publicado: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
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
 * Busca notícias por categoria utilizando filtro exato pela coluna category_slug no Supabase.
 */
export async function getNoticiasByCategory(categoriaOrSlug: string, limit = 12): Promise<NoticiaListItem[]> {
  const catInfo = getCategoryStyle(categoriaOrSlug);
  const targetSlug = catInfo.slug;
  const targetName = catInfo.name;

  const matchingSlugs: CategorySlug[] =
    targetSlug === 'cultura-lazer-variedades'
      ? ['cultura-lazer-variedades', 'cultura', 'lazer-variedades']
      : [targetSlug];

  if (!isConfigured) {
    return mockNoticiasList
      .filter((n) => {
        const itemSlug = n.category_slug || normalizeCategorySlug(n.categoria, n.titulo);
        return matchingSlugs.includes(itemSlug) && n.publicado;
      })
      .slice(0, limit);
  }

  const primaryClient = getReadClient();
  try {
    // 1. Tenta consulta exata pela coluna category_slug no Supabase (Diretriz 4)
    let { data, error } = await primaryClient
      .from('noticias')
      .select('id, titulo, slug, resumo, categoria, category_slug, imagem, created_at, autor, publicado')
      .in('category_slug', matchingSlugs)
      .or('publicado.eq.true,publicado.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    // 2. Se a coluna category_slug não existir no Supabase ou não retornar itens, tenta compatibilidade por categoria textual
    if (error || !data || data.length === 0) {
      const textFilter =
        targetSlug === 'cultura-lazer-variedades'
          ? 'categoria.ilike.%cultura%,categoria.ilike.%lazer%,categoria.ilike.%variedade%'
          : `categoria.ilike.%${targetName}%,categoria.ilike.%${targetSlug}%`;

      const fallbackAttempt = await primaryClient
        .from('noticias')
        .select('id, titulo, slug, resumo, categoria, imagem, created_at, autor, publicado')
        .or(textFilter)
        .or('publicado.eq.true,publicado.is.null')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!fallbackAttempt.error && fallbackAttempt.data && fallbackAttempt.data.length > 0) {
        data = fallbackAttempt.data as any;
        error = null;
      }
    }

    if (error) {
      const fallbackClient = primaryClient === supabaseAdmin ? supabase : (supabaseServiceKey ? supabaseAdmin : null);
      if (fallbackClient) {
        const retry = await fallbackClient
          .from('noticias')
          .select('id, titulo, slug, resumo, categoria, category_slug, imagem, created_at, autor, publicado')
          .in('category_slug', matchingSlugs)
          .or('publicado.eq.true,publicado.is.null')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }
    }

    if (error) {
      handleSupabaseQueryError('getNoticiasByCategory', error);
      return mockNoticiasList
        .filter((n) => {
          const itemSlug = n.category_slug || normalizeCategorySlug(n.categoria);
          return itemSlug === targetSlug && n.publicado;
        })
        .slice(0, limit);
    }

    isTableMissing = false;
    const items = (data as NoticiaListItem[]) || [];
    return items.map((item) => ({
      ...item,
      category_slug: item.category_slug || targetSlug,
    }));
  } catch (err) {
    handleSupabaseQueryError('getNoticiasByCategory', err);
    return mockNoticiasList
      .filter((n) => {
        const itemSlug = n.category_slug || normalizeCategorySlug(n.categoria);
        return itemSlug === targetSlug && n.publicado;
      })
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
  const catInfo = getCategoryStyle(payload.categoria || payload.category_slug);

  if (!isConfigured) {
    const newNoticia: Noticia = {
      id: crypto.randomUUID(),
      titulo: payload.titulo,
      slug: payload.slug,
      resumo: payload.resumo,
      conteudo: payload.conteudo,
      categoria: catInfo.name,
      category_slug: catInfo.slug,
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
    const insertPayload: any = {
      titulo: payload.titulo,
      slug: payload.slug,
      resumo: payload.resumo,
      conteudo: payload.conteudo,
      categoria: catInfo.name,
      category_slug: catInfo.slug,
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

    // Se o erro for de coluna inexistente (ex: tabela antiga sem category_slug), tenta sem a coluna
    if (error && (error.code === '42703' || error.message?.includes('category_slug'))) {
      delete insertPayload.category_slug;
      const retryWithoutSlug = await primaryClient
        .from('noticias')
        .insert(insertPayload)
        .select()
        .single();
      if (!retryWithoutSlug.error) {
        data = retryWithoutSlug.data;
        error = null;
      }
    }

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
  let normalizedCatInfo: ReturnType<typeof getCategoryStyle> | null = null;
  if (payload.categoria || payload.category_slug) {
    normalizedCatInfo = getCategoryStyle(payload.categoria || payload.category_slug);
  }

  if (!isConfigured) {
    const index = mockNoticiasList.findIndex((n) => n.id === id);
    if (index === -1) return { data: null, error: 'Notícia não encontrada.' };
    
    mockNoticiasList[index] = {
      ...mockNoticiasList[index],
      ...payload,
      ...(normalizedCatInfo
        ? { categoria: normalizedCatInfo.name, category_slug: normalizedCatInfo.slug }
        : {}),
      updated_at: new Date().toISOString(),
    };
    return { data: mockNoticiasList[index], error: null };
  }

  try {
    const updateData: any = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    if (normalizedCatInfo) {
      updateData.categoria = normalizedCatInfo.name;
      updateData.category_slug = normalizedCatInfo.slug;
    }

    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    let { data, error } = await primaryClient
      .from('noticias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Se o erro for de coluna inexistente (banco antigo sem category_slug), tenta sem a coluna
    if (error && (error.code === '42703' || error.message?.includes('category_slug'))) {
      delete updateData.category_slug;
      const retryWithoutSlug = await primaryClient
        .from('noticias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (!retryWithoutSlug.error) {
        data = retryWithoutSlug.data;
        error = null;
      }
    }

    if (error && primaryClient !== supabase) {
      const anonAttempt = await supabase
        .from('noticias')
        .update(updateData)
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
 * Remove TODAS as notícias cadastradas no portal (banco Supabase e lista local).
 */
export async function deleteAllNoticias(): Promise<{ success: boolean; count: number; error: string | null }> {
  const previousCount = mockNoticiasList.length;
  mockNoticiasList = [];

  if (!isConfigured) {
    return { success: true, count: previousCount, error: null };
  }

  try {
    const primaryClient = supabaseServiceKey ? supabaseAdmin : supabase;
    // PostgREST exige um predicado WHERE para DELETE em massa
    let { error, count } = await primaryClient
      .from('noticias')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error && primaryClient !== supabase) {
      const anonAttempt = await supabase
        .from('noticias')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (!anonAttempt.error) {
        error = null;
        count = anonAttempt.count;
      }
    }

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    isTableMissing = false;
    return { success: true, count: count ?? previousCount, error: null };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Erro ao excluir todas as notícias.' };
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

