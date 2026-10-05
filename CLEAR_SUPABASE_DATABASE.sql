-- =============================================================================
-- SCRIPT PARA ZERAR / APAGAR DADOS DE TESTE NO SUPABASE
-- =============================================================================
-- Abra o SQL Editor no seu projeto do Supabase (https://app.supabase.com)
-- Cole o código abaixo e clique em "Run". Isso limpará todos os dados fictícios!
-- =============================================================================

TRUNCATE TABLE public.time_records CASCADE;
TRUNCATE TABLE public.allowances CASCADE;
TRUNCATE TABLE public.employees CASCADE;
TRUNCATE TABLE public.stock_movements CASCADE;
TRUNCATE TABLE public.products CASCADE;
