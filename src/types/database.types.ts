export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Noticia = Database['public']['Tables']['noticias']['Row'];

export type NoticiaListItem = Pick<
  Noticia,
  'id' | 'titulo' | 'slug' | 'resumo' | 'categoria' | 'imagem' | 'created_at' | 'autor'
>;

export type NoticiaDetail = Pick<
  Noticia,
  'id' | 'titulo' | 'slug' | 'resumo' | 'conteudo' | 'categoria' | 'imagem' | 'created_at' | 'autor'
>;

export type NoticiaInsert = Database['public']['Tables']['noticias']['Insert'];
export type NoticiaUpdate = Database['public']['Tables']['noticias']['Update'];

