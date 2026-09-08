-- ================================================================
-- اللوحة الإدارية — QuickData
-- الخطوة 8: توثيق جدول موديول التواصل بين الإدارات (admin_correspondence)
-- ملف توثيقي فقط — الجدول ده كان موجود بالفعل على القاعدة الفعلية
-- (مؤكَّد عبر Supabase MCP في project_plan.md، قسم 3 و4) قبل بناء
-- واجهة correspondence.html. الملف ده لإعادة الإنشاء في بيئة أخرى فقط
-- (تطوير محلي، نسخة احتياطية، إلخ). آمن لإعادة التشغيل (IF NOT EXISTS).
-- ================================================================

create extension if not exists pgcrypto;

-- ================================================================
-- 1) جدول التواصل بين الإدارات
--   department: نص حر (مفيش جدول أقسام منفصل في التوصيف الأصلي)
--   status: pending (قيد الانتظار) | in_progress (قيد المتابعة) | resolved (تم الإنجاز)
--   ⚠️ قيم status افتراض معقول من نمط باقي الموديولات — التوصيف الأصلي (التسجيل الصوتي)
--   لم يحدد قيم الحالة بالظبط لهذا الموديول، يحتاج تأكيد من العميل لو عايز مسميات مختلفة.
-- ================================================================
create table if not exists public.admin_correspondence (
    id uuid primary key default gen_random_uuid(),
    subject text not null,
    department text,
    correspondence_date date not null default current_date,
    status text not null default 'pending',
    notes text,
    created_at timestamptz default now()
);

create index if not exists idx_admin_correspondence_status on public.admin_correspondence (status);
create index if not exists idx_admin_correspondence_dept on public.admin_correspondence (department);
create index if not exists idx_admin_correspondence_date on public.admin_correspondence (correspondence_date);

-- ================================================================
-- 2) الحماية على مستوى الصفوف (نفس سياسة باقي جداول النظام)
-- ================================================================
alter table public.admin_correspondence enable row level security;

drop policy if exists "admin_correspondence_all" on public.admin_correspondence;
create policy "admin_correspondence_all" on public.admin_correspondence for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- تم! افتح Table Editor للتأكد إن جدول admin_correspondence ظاهر.
-- ================================================================
