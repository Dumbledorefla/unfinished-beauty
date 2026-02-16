
-- Reações nos artigos (tipo Medium)
CREATE TABLE IF NOT EXISTS blog_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_reactions_user 
ON blog_reactions(post_id, user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_reactions_session 
ON blog_reactions(post_id, session_id) WHERE session_id IS NOT NULL;

-- Comentários nos artigos
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id, created_at);

-- Artigos salvos/favoritados
CREATE TABLE IF NOT EXISTS blog_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Adicionar colunas de contagem no blog_posts (cache)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- RLS
ALTER TABLE blog_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Políticas: reações
CREATE POLICY "Qualquer um pode ver reações" ON blog_reactions FOR SELECT USING (true);
CREATE POLICY "Usuários logados podem reagir" ON blog_reactions FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);
CREATE POLICY "Usuários podem remover suas reações" ON blog_reactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas reações" ON blog_reactions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas: comentários
CREATE POLICY "Qualquer um pode ver comentários publicados" ON blog_comments FOR SELECT USING (status = 'published');
CREATE POLICY "Usuários logados podem comentar" ON blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus comentários" ON blog_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus comentários" ON blog_comments FOR DELETE USING (auth.uid() = user_id);

-- Políticas: bookmarks
CREATE POLICY "Usuários veem seus bookmarks" ON blog_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem salvar artigos" ON blog_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover bookmarks" ON blog_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar contagem de reações
CREATE OR REPLACE FUNCTION update_blog_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts SET reaction_count = COALESCE(reaction_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts SET reaction_count = GREATEST(0, COALESCE(reaction_count, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_blog_reaction_count ON blog_reactions;
CREATE TRIGGER trg_blog_reaction_count
AFTER INSERT OR DELETE ON blog_reactions
FOR EACH ROW EXECUTE FUNCTION update_blog_reaction_count();

-- Trigger para atualizar contagem de comentários
CREATE OR REPLACE FUNCTION update_blog_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts SET comment_count = GREATEST(0, COALESCE(comment_count, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_blog_comment_count ON blog_comments;
CREATE TRIGGER trg_blog_comment_count
AFTER INSERT OR DELETE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_blog_comment_count();
