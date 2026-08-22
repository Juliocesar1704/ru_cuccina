-- ==========================================================================
-- RU CUCCINA - Script de Criação do Banco de Dados (Supabase / PostgreSQL)
-- Execute este script no SQL Editor do seu painel Supabase (https://supabase.com)
-- ==========================================================================

-- 1. Tabela de Usuários / Clientes Cadastrados
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  complement TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Pedidos do Delivery
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_cpf TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_change TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  is_dispatched BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Segurança por Linha (Row Level Security - RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso Público (Leitura, Criação e Atualização para o Delivery)
CREATE POLICY "Permitir leitura pública de usuários" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir cadastro de novos usuários" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de usuários" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura de pedidos" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Permitir criação de novos pedidos" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de status dos pedidos" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de pedidos" ON public.orders FOR DELETE USING (true);

-- 5. Habilitar Publicação em Tempo Real (Realtime) para a tabela de Pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
