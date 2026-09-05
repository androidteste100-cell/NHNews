-- ==============================================================================
-- SCHEMA DO SUPABASE: PORTAL DE NOTÍCIAS
-- ==============================================================================

-- 1. Criação da tabela de notícias
CREATE TABLE IF NOT EXISTS noticias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    resumo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    imagem TEXT NOT NULL,
    autor VARCHAR(100) DEFAULT 'Redação',
    publicado BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices de performance para consultas frequentes e SEO
CREATE INDEX IF NOT EXISTS idx_slug ON noticias(slug);
CREATE INDEX IF NOT EXISTS idx_categoria ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_created ON noticias(created_at DESC);

-- 3. Habilitação de Row Level Security (RLS)
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- 4. Política de leitura pública para visitantes anônimos e autenticados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' AND policyname = 'Permitir leitura pública de notícias'
    ) THEN
        CREATE POLICY "Permitir leitura pública de notícias"
        ON noticias
        FOR SELECT
        TO public
        USING (publicado = true);
    END IF;
END $$;

-- 5. Política de gerenciamento para criação, edição e exclusão (Admin)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' AND policyname = 'Permitir gerenciamento pelo painel admin'
    ) THEN
        CREATE POLICY "Permitir gerenciamento pelo painel admin"
        ON noticias
        FOR ALL
        TO public
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

