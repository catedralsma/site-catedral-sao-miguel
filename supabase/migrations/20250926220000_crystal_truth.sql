/*
  # Update slides table for homepage highlights

  1. New Columns
    - `link_url` (text) - URL externo ou rota interna específica
    - `link_text` (text) - Texto do botão de ação (ex: "Ler Mais", "Saiba Mais")
    - `content_type` (text) - Tipo de conteúdo ('custom', 'blog_post', 'announcement', 'event')
    - `related_content_id` (text) - ID de item relacionado (blog_post, parish_announcement, celebration)

  2. Security
    - Mantém RLS existente na tabela slides
    - Adiciona validação para content_type
*/

-- Adicionar novas colunas à tabela slides
DO $$
BEGIN
  -- Adicionar link_url se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'link_url'
  ) THEN
    ALTER TABLE slides ADD COLUMN link_url text;
  END IF;

  -- Adicionar link_text se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'link_text'
  ) THEN
    ALTER TABLE slides ADD COLUMN link_text text;
  END IF;

  -- Adicionar content_type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE slides ADD COLUMN content_type text DEFAULT 'custom';
  END IF;

  -- Adicionar related_content_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'related_content_id'
  ) THEN
    ALTER TABLE slides ADD COLUMN related_content_id text;
  END IF;
END $$;

-- Adicionar constraint para content_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'slides' AND constraint_name = 'slides_content_type_check'
  ) THEN
    ALTER TABLE slides ADD CONSTRAINT slides_content_type_check 
    CHECK (content_type IN ('custom', 'blog_post', 'announcement', 'event'));
  END IF;
END $$;

-- Atualizar slides existentes para ter content_type 'custom' se for NULL
UPDATE slides 
SET content_type = 'custom' 
WHERE content_type IS NULL;