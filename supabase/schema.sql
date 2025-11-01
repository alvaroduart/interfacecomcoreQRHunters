-- ============================================
-- SCHEMA QR HUNTERS - SUPABASE
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: questions (Perguntas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: answers (Respostas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: qrcodes (QR Codes dos Pontos de Controle)
-- ============================================
CREATE TABLE IF NOT EXISTS public.qrcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    location_name TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: validations (Histórico de Validações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    qrcode_id UUID NOT NULL REFERENCES public.qrcodes(id) ON DELETE CASCADE,
    answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
    user_latitude DECIMAL(10, 8) NOT NULL,
    user_longitude DECIMAL(11, 8) NOT NULL,
    distance_meters DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('acertou', 'errou')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para melhor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_qrcodes_code ON public.qrcodes(code);
CREATE INDEX IF NOT EXISTS idx_qrcodes_question_id ON public.qrcodes(question_id);
CREATE INDEX IF NOT EXISTS idx_validations_user_id ON public.validations(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_qrcode_id ON public.validations(qrcode_id);
CREATE INDEX IF NOT EXISTS idx_validations_created_at ON public.validations(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;

-- Políticas para questions (Perguntas) - Leitura pública
CREATE POLICY "Questions são públicas para leitura"
    ON public.questions FOR SELECT
    USING (true);

-- Políticas para answers (Respostas) - Leitura pública
CREATE POLICY "Answers são públicas para leitura"
    ON public.answers FOR SELECT
    USING (true);

-- Políticas para qrcodes (QR Codes) - Leitura pública
CREATE POLICY "QRCodes são públicos para leitura"
    ON public.qrcodes FOR SELECT
    USING (true);

-- Políticas para validations (Validações)
CREATE POLICY "Usuários podem inserir suas próprias validações"
    ON public.validations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas próprias validações"
    ON public.validations FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qrcodes_updated_at
    BEFORE UPDATE ON public.qrcodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir perguntas
INSERT INTO public.questions (id, text) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Qual é o principal recurso disponível neste local?'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Quantos computadores estão disponíveis neste laboratório?'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Qual esporte NÃO pode ser praticado nesta quadra?')
ON CONFLICT (id) DO NOTHING;

-- Inserir respostas para pergunta 1
INSERT INTO public.answers (question_id, text, is_correct) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Livros e materiais de estudo', true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Equipamentos esportivos', false),
    ('550e8400-e29b-41d4-a716-446655440001', 'Refeitório', false),
    ('550e8400-e29b-41d4-a716-446655440001', 'Laboratório químico', false)
ON CONFLICT DO NOTHING;

-- Inserir respostas para pergunta 2
INSERT INTO public.answers (question_id, text, is_correct) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '10 computadores', false),
    ('550e8400-e29b-41d4-a716-446655440002', '20 computadores', false),
    ('550e8400-e29b-41d4-a716-446655440002', '30 computadores', true),
    ('550e8400-e29b-41d4-a716-446655440002', '40 computadores', false)
ON CONFLICT DO NOTHING;

-- Inserir respostas para pergunta 3
INSERT INTO public.answers (question_id, text, is_correct) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'Basquete', false),
    ('550e8400-e29b-41d4-a716-446655440003', 'Vôlei', false),
    ('550e8400-e29b-41d4-a716-446655440003', 'Futsal', false),
    ('550e8400-e29b-41d4-a716-446655440003', 'Natação', true)
ON CONFLICT DO NOTHING;

-- Inserir QR Codes
INSERT INTO public.qrcodes (code, location_name, latitude, longitude, description, question_id) VALUES
    ('CHECKPOINT001', 'Biblioteca do CEFET-MG', -19.9327, -43.9943, 'Entrada principal da biblioteca', '550e8400-e29b-41d4-a716-446655440001'),
    ('CHECKPOINT002', 'Laboratório de Informática', -19.9325, -43.9940, 'Sala 201 - Laboratório', '550e8400-e29b-41d4-a716-446655440002'),
    ('CHECKPOINT003', 'Quadra de Esportes', -19.9330, -43.9945, 'Quadra poliesportiva coberta', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para ver QR Codes completos com perguntas e respostas
CREATE OR REPLACE VIEW public.qrcodes_complete AS
SELECT 
    qr.id,
    qr.code,
    qr.location_name,
    qr.latitude,
    qr.longitude,
    qr.description,
    q.id as question_id,
    q.text as question_text,
    json_agg(
        json_build_object(
            'id', a.id,
            'text', a.text,
            'is_correct', a.is_correct
        ) ORDER BY a.created_at
    ) as answers
FROM public.qrcodes qr
JOIN public.questions q ON qr.question_id = q.id
JOIN public.answers a ON a.question_id = q.id
GROUP BY qr.id, qr.code, qr.location_name, qr.latitude, qr.longitude, qr.description, q.id, q.text;

-- View para estatísticas de validações por usuário
CREATE OR REPLACE VIEW public.user_validation_stats AS
SELECT 
    v.user_id,
    COUNT(*) as total_validations,
    COUNT(*) FILTER (WHERE v.status = 'acertou') as correct_validations,
    COUNT(*) FILTER (WHERE v.status = 'errou') as wrong_validations,
    ROUND(
        (COUNT(*) FILTER (WHERE v.status = 'acertou')::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as success_rate,
    AVG(v.distance_meters) as avg_distance_meters
FROM public.validations v
GROUP BY v.user_id;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE public.questions IS 'Perguntas associadas aos pontos de controle';
COMMENT ON TABLE public.answers IS 'Respostas possíveis para as perguntas';
COMMENT ON TABLE public.qrcodes IS 'QR Codes dos pontos de controle com localização GPS';
COMMENT ON TABLE public.validations IS 'Histórico de tentativas de validação dos usuários';

COMMENT ON COLUMN public.qrcodes.latitude IS 'Latitude em graus decimais (-90 a 90)';
COMMENT ON COLUMN public.qrcodes.longitude IS 'Longitude em graus decimais (-180 a 180)';
COMMENT ON COLUMN public.validations.distance_meters IS 'Distância em metros entre usuário e ponto de controle';
