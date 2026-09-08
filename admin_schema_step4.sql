-- ================================================================
-- اللوحة الإدارية — حراء للسياحة
-- الخطوة 4: جدول العقود (Contracts)
-- انسخ هذا الملف بالكامل والصقه في: Supabase Dashboard → SQL Editor → New query
-- ثم اضغط RUN مرة واحدة. آمن لإعادة التشغيل (IF NOT EXISTS في كل مكان).
--
-- ملاحظة: تم تنفيذ هذا الملف بالفعل مباشرة على القاعدة الفعلية عبر
-- Supabase MCP Connector بتاريخ 2026-09-08. موجود هنا فقط للتوثيق
-- ولإعادة الإنشاء في بيئة أخرى (تطوير محلي، نسخة احتياطية، إلخ).
-- ================================================================

create extension if not exists pgcrypto;

-- ================================================================
-- جدول العقود
--   expiry_date مضافة (غير مذكورة صراحةً في الخطة الأصلية) عشان نقدر
--   نحسب حالة العقد (سارٍ / قارب على الانتهاء / منتهي) في الواجهة
--   ونبعت تنبيهات مركزية بنفس منطق باقي الموديولات (زي رخص السيارات).
-- ================================================================
create table if not exists public.admin_contracts (
    id uuid primary key default gen_random_uuid(),
    contract_type text not null,
    owner_name text not null,
    branch_id uuid references public.admin_branches(id) on delete set null,
    contract_date date not null default current_date,
    expiry_date date,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_admin_contracts_branch on public.admin_contracts (branch_id);
create index if not exists idx_admin_contracts_expiry on public.admin_contracts (expiry_date);

alter table public.admin_contracts enable row level security;

drop policy if exists "admin_contracts_all" on public.admin_contracts;
create policy "admin_contracts_all" on public.admin_contracts for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- تم! افتح Table Editor للتأكد إن جدول admin_contracts ظهر بنجاح.
-- ================================================================
