export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const CATEGORY_SLUGS = [
  'policia',
  'maceio',
  'interior',
  'politica',
  'economia',
  'esporte',
  'mundo',
  'cultura-lazer-variedades',
  'cultura',
  'lazer-variedades',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export enum CategorySlugEnum {
  Policia = 'policia',
  Maceio = 'maceio',
  Interior = 'interior',
  Politica = 'politica',
  Economia = 'economia',
  Esporte = 'esporte',
  Mundo = 'mundo',
  CulturaLazerVariedades = 'cultura-lazer-variedades',
  Cultura = 'cultura',
  LazerVariedades = 'lazer-variedades',
}

export interface Database {
  public: {
    Tables: {
      noticias: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          resumo: string;
          conteudo: string;
          categoria: string;
          category_slug?: CategorySlug;
          imagem: string;
          autor: string;
          publicado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          resumo: string;
          conteudo: string;
          categoria: string;
          category_slug?: CategorySlug;
          imagem: string;
          autor?: string;
          publicado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          slug?: string;
          resumo?: string;
          conteudo?: string;
          categoria?: string;
          category_slug?: CategorySlug;
          imagem?: string;
          autor?: string;
          publicado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      category_slug: CategorySlug;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Noticia = Database['public']['Tables']['noticias']['Row'];

export type NoticiaListItem = Pick<
  Noticia,
  'id' | 'titulo' | 'slug' | 'resumo' | 'categoria' | 'imagem' | 'created_at' | 'autor'
> & {
  category_slug?: CategorySlug;
};

export type NoticiaDetail = Pick<
  Noticia,
  'id' | 'titulo' | 'slug' | 'resumo' | 'conteudo' | 'categoria' | 'imagem' | 'created_at' | 'autor'
> & {
  category_slug?: CategorySlug;
};

export type NoticiaInsert = Database['public']['Tables']['noticias']['Insert'];
export type NoticiaUpdate = Database['public']['Tables']['noticias']['Update'];

