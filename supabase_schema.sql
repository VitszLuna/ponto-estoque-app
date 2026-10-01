-- =============================================================================
-- ESQUEMA COMPLETO DE BANCO DE DADOS SUPABASE / POSTGRESQL - PONTO & ESTOQUE
-- =============================================================================
-- Execute este script completo no SQL Editor do seu projeto Supabase (https://app.supabase.com)
-- para criar todas as tabelas, índices e políticas de segurança.
-- =============================================================================

-- 1. TABELA DE FUNCIONÁRIOS (employees)
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cpf TEXT,
    role TEXT NOT NULL DEFAULT 'Funcionário',
    department TEXT NOT NULL DEFAULT 'Geral',
    standard_daily_hours NUMERIC(4,2) DEFAULT 8.80, -- Padrão CLT 8 horas e 48 minutos (8.8h)
    work_saturdays BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    admission_date DATE DEFAULT CURRENT_DATE,
    dismissal_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE REGISTROS DE PONTO (time_records)
CREATE TABLE IF NOT EXISTS public.time_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TEXT,       -- Entrada (ex: '08:00')
    lunch_start TEXT,    -- Saída pro Almoço (ex: '12:00')
    lunch_end TEXT,      -- Retorno do Almoço (ex: '13:00')
    clock_out TEXT,      -- Saída do Serviço (ex: '17:48')
    notes TEXT,
    abono_hours NUMERIC(4,2) DEFAULT 0.00,
    abono_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_emp_date UNIQUE (employee_id, date)
);

-- 3. TABELA DE ABONOS E ATESTADOS (allowances)
CREATE TABLE IF NOT EXISTS public.allowances (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT DEFAULT 'atestado', -- 'atestado', 'folga', 'abono_parcial'
    hours_credited NUMERIC(4,2) DEFAULT 8.80,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE PRODUTOS / ESTOQUE (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'UN',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (stock_movements)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    product_code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
    quantity NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE DE CONSULTA
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_time_records_emp_date ON public.time_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_allowances_emp_date ON public.allowances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_code ON public.stock_movements(product_code);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(date);

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- =============================================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir Acesso Total Employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Permitir Acesso Total TimeRecords" ON public.time_records FOR ALL USING (true);
CREATE POLICY "Permitir Acesso Total Allowances" ON public.allowances FOR ALL USING (true);
CREATE POLICY "Permitir Acesso Total Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Permitir Acesso Total StockMovements" ON public.stock_movements FOR ALL USING (true);
