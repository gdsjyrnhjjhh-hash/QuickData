-- ================================================================
-- اللوحة الإدارية — QuickData
-- الخطوة 1: جدولا الأساس المشترك لكل الموديولات القادمة
-- انسخ هذا الملف بالكامل والصقه في: Supabase Dashboard → SQL Editor → New query
-- (مشروع QuickData ProSoft V.1 الخاص بـ Supabase)
-- ثم اضغط RUN مرة واحدة. آمن لإعادة التشغيل (IF NOT EXISTS في كل مكان).
-- ================================================================

create extension if not exists pgcrypto;

-- ================================================================
-- 1) جدول الفروع (Branches)
-- تُستخدم في كل الموديولات القادمة: المشتريات، السيارات، العقود...
-- بدل ما يتكرر كتابة اسم الفرع كنص حر في كل مكان
-- ================================================================
create table if not exists public.admin_branches (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- ================================================================
-- 2) جدول الإشعارات المركزي (Notifications)
-- كل موديول قادم (المهام، السيارات، العقود...) هيسجل إشعاراته هنا
-- بدل ما يبني نظام إشعارات منفصل لكل موديول
--   module: اسم الموديول المصدر (tasks / vehicles / purchases / ideas / contracts...)
--   level : info / warning / danger (تستخدم لتلوين الإشعار في الواجهة)
--   ref_table / ref_id: لو الإشعار مرتبط بصف معيّن في جدول معيّن (اختياري)
-- ================================================================
create table if not exists public.admin_notifications (
    id uuid primary key default gen_random_uuid(),
    module text not null,
    title text not null,
    message text,
    level text default 'info',
    ref_table text,
    ref_id uuid,
    is_read boolean default false,
    created_at timestamptz default now()
);

create index if not exists idx_admin_notifications_is_read on public.admin_notifications (is_read);
create index if not exists idx_admin_notifications_module on public.admin_notifications (module);

-- ================================================================
-- 3) تفعيل الحماية على مستوى الصفوف (RLS)
-- نفس سياسة باقي جداول النظام: أي مستخدم "مسجّل دخول" (authenticated)
-- له صلاحية كاملة، لأن ده نظام داخلي لشركة واحدة يشترك فيه الموظفون
-- ================================================================
alter table public.admin_branches      enable row level security;
alter table public.admin_notifications enable row level security;

drop policy if exists "admin_branches_all" on public.admin_branches;
create policy "admin_branches_all" on public.admin_branches for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin_notifications_all" on public.admin_notifications;
create policy "admin_notifications_all" on public.admin_notifications for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- تم! افتح Table Editor للتأكد إن الجدولين ظهرا بنجاح:
-- admin_branches, admin_notifications
-- ================================================================
