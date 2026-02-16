
-- Upsert oracle_products with correct pricing and preview_lines
INSERT INTO oracle_products (oracle_type, name, description, price, is_free, preview_lines)
VALUES 
  ('tarot-dia', 'Tarot do Dia', 'Carta do dia com mensagem personalizada', 0, true, 99),
  ('tarot-amor', 'Tarot do Amor', 'Leitura de 3 cartas sobre sua vida amorosa', 9.90, false, 3),
  ('tarot-completo', 'Tarot Completo', 'Leitura completa com 6 cartas', 14.90, false, 3),
  ('horoscopo', 'Horóscopo Detalhado', 'Horóscopo completo com amor, trabalho e saúde', 4.90, false, 2),
  ('numerologia', 'Mapa Numerológico', 'Análise numerológica completa', 9.90, false, 2),
  ('mapa-astral', 'Mapa Astral Completo', 'Mapa astral com todos os planetas e casas', 12.90, false, 2),
  ('compatibilidade', 'Compatibilidade Detalhada', 'Análise completa de compatibilidade entre signos', 7.90, false, 2)
ON CONFLICT (oracle_type) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_free = EXCLUDED.is_free,
  preview_lines = EXCLUDED.preview_lines;
