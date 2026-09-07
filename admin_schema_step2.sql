-- ================================================================
-- اللوحة الإدارية — حراء للسياحة
-- الخطوة 2: جدول المهام (تنسيق الأعمال)
-- انسخ هذا الملف بالكامل والصقه في: Supabase Dashboard → SQL Editor → New query
-- (بعد ما تكون شغّلت admin_schema_step1.sql الأول)
-- ثم اضغط RUN مرة واحدة. آمن لإعادة التشغيل (IF NOT EXISTS في كل مكان).
-- ================================================================

create extension if not exists pgcrypto;

-- ================================================================
-- جدول المهام
--   priority: critical (مهم جدًا) | important (مهم فقط) | deferrable (ممكن يتأجل)
--   status  : pending (قيد التنفيذ) | deferred (أُجّلت) | done (نُفّذت) | transferred (رُحّلت)
-- ================================================================
create table if not exists public.admin_tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    coordinated_with text,
    priority text not null default 'important',
    status text not null default 'pending',
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_admin_tasks_status on public.admin_tasks (status);
create index if not exists idx_admin_tasks_priority on public.admin_tasks (priority);

alter table public.admin_tasks enable row level security;

drop policy if exists "admin_tasks_all" on public.admin_tasks;
create policy "admin_tasks_all" on public.admin_tasks for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- تم! افتح Table Editor للتأكد إن جدول admin_tasks ظهر بنجاح.
-- إشعارات التأخير هتتسجل تلقائيًا في جدول admin_notifications
-- (اللي اتعمل في الخطوة 1) بمعرفة صفحة tasks.html نفسها عند فتحها.
-- ================================================================
