-- ================================================================
-- اللوحة الإدارية — QuickData
-- الخطوة 3: جدول تطوير الأفكار (Business Ideas)
-- انسخ هذا الملف بالكامل والصقه في: Supabase Dashboard → SQL Editor → New query
-- ثم اضغط RUN مرة واحدة. آمن لإعادة التشغيل (IF NOT EXISTS في كل مكان).
--
-- ملاحظة: تم تنفيذ هذا الملف بالفعل مباشرة على القاعدة الفعلية عبر
-- Supabase MCP Connector بتاريخ 2026-09-08. موجود هنا فقط للتوثيق
-- ولإعادة الإنشاء في بيئة أخرى (تطوير محلي، نسخة احتياطية، إلخ).
-- ================================================================

create extension if not exists pgcrypto;

-- ================================================================
-- جدول تطوير الأفكار
--   status: new (جديدة) | under_review (قيد الدراسة) | approved (معتمدة)
--           | rejected (مرفوضة) | implemented (مُنفَّذة)
-- ================================================================
create table if not exists public.admin_ideas (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    department text,
    status text not null default 'new',
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_admin_ideas_status on public.admin_ideas (status);

alter table public.admin_ideas enable row level security;

drop policy if exists "admin_ideas_all" on public.admin_ideas;
create policy "admin_ideas_all" on public.admin_ideas for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- تم! افتح Table Editor للتأكد إن جدول admin_ideas ظهر بنجاح.
-- ================================================================
