# خطة تطوير اللوحة الإدارية — QuickData

> **ملف توثيق حي** — أي محادثة جديدة (أو مساعد ذكاء اصطناعي جديد) يجب أن تقرأ هذا الملف أولاً قبل أي تعديل.
> المشروع الحقيقي والمعتمد هو نفس الملفات المرفقة هنا: theme.css, layout.js, supabase.js, login.html,
> index.html, tasks.html, ideas.html, contracts.html, vehicles.html, وملفات admin_schema_stepN.sql.

## 0. تحديث 2026-09-08 (أ) — تصحيح مهم بخصوص "حراء للسياحة" (مُنفَّذ بالكامل)

كان فيه خطأ متكرر في نسخة سابقة من الملفات: عبارات وتعليقات بتقول إن تسجيل الدخول ومشروع Supabase
بتوع QuickData **مشتركين** مع نظام "حراء للسياحة" المحاسبي. **العميل صحّح الأمر صراحةً: ده غير صحيح.**
QuickData مشروع Supabase مستقل تمامًا (QuickData ProSoft V.1, project_id: hecsuitrqtbzgbbjjtbf)،
وله مستخدموه الخاصون، ومفيش أي مشاركة بيانات دخول مع أي نظام آخر.

تم تنظيف كل الإشارات الخاطئة دي من 6 ملفات (login.html — بما فيها **نص كان ظاهر فعليًا للمستخدم**
في صفحة الدخول —, layout.js, theme.css, supabase.js, admin_schema_step1.sql, STEP1_README.md).
تم التأكد بـ grep شامل على كل ملفات الكود: **لا توجد أي إشارة متبقية**.

**أي محادثة جديدة: لو شفت أي إشارة لـ"حراء" في أي ملف تاني من المشروع، امسحها فورًا.**

## 0. تحديث 2026-09-08 (ب) — موديول السيارات مكتمل الآن (واجهة + قاعدة)

- أُضيف عمود `insurance_expiry` لجدول `admin_vehicles` (كان ناقصًا رغم طلب العميل الصريح له في
  التسجيل الصوتي) — موثّق في `admin_schema_step5.sql` ومُنفَّذ فعليًا على القاعدة.
- **`vehicles.html`** صفحة جديدة كاملة على نفس نمط `contracts.html`:
  - فورم إضافة سيارة (رقم اللوحة، النوع، الفرع، الرقم التسلسلي، 3 تواريخ انتهاء).
  - 5 تبويبات: الكل / نشطة / مركونة / معروضة للبيع / منتهية-خارج الخدمة — تغطي كل الحالات
    المطلوبة في التسجيل الصوتي ("مركونة"، "بيتم بيعها"، "انتهت").
  - **فلتر بالفرع** فوق الجدول — يحقق طلب العميل "فصل كل فرع لوحده" من غير الحاجة لصفحة منفصلة لكل فرع.
  - تنبيهات تلقائية (client-side، بنفس منطق tasks/contracts) لكل واحد من الثلاثة مستقلًا: الاستمارة،
    الفحص، **التأمين** — تُسجَّل في `admin_notifications` بفارق 30 يوم قبل الانتهاء + عند الانتهاء الفعلي.
  - حالة كل سيارة قابلة للتغيير مباشرة من الجدول (select) زي عمود الحالة في tasks.html.
- تم ربط رابط "السيارات" فعليًا (بدل "قريبًا") في السايدبار وكارت الاختصار في **كل** الصفحات:
  index.html, tasks.html, ideas.html, contracts.html, vehicles.html نفسها.
- `index.html`: كارت الإحصائيات بيعرض دلوقتي **عدد السيارات النشطة فعليًا** بدل "— (قريبًا)".

## 1. معلومات المشروع (Supabase)
- اسم المشروع: **QuickData ProSoft V.1**
- project_id: hecsuitrqtbzgbbjjtbf
- Project URL: https://hecsuitrqtbzgbbjjtbf.supabase.co
- **مشروع مستقل تمامًا** — لا يشارك أي باك إند أو بيانات دخول مع أي نظام آخر.
- يُدار عبر **Supabase MCP Connector** — التنفيذ يتم مباشرة على القاعدة الفعلية (لازم توصيل
  الـ connector أولًا في أي محادثة جديدة قبل تنفيذ أي SQL).
- **كل الجداول ببادئة admin_ وعمود id من نوع uuid** — هذا هو التوافق المطلوب لأي جدول جديد.

## 2. مصدر المتطلبات
تفريغ صوتي من الأستاذ محمد يصف 7 موديولات: المهام، السيارات، المشتريات (+موردين+عروض أسعار)،
تطوير الأفكار، استلام/تسليم الأعمال، إدارات أخرى (تواصل بين الأقسام)، العقود.

**⚠️ التسجيل الصوتي غير مكتمل** — ينقطع فجأة عند وصف "sheet رقم اتنين" في موديول تطوير الأفكار.
**لسه مفيش إجابة من العميل** هل فيه شيت تاني مطلوب في الموديول ده ولا لأ.

## 3. حالة الموديولات (مؤكَّدة بالفحص المباشر عبر Supabase MCP، آخر تحديث 2026-09-08)

| الموديول | الجدول | الحالة | واجهة (.html)؟ |
|---|---|---|---|
| الأساس (فروع + إشعارات مركزية) | admin_branches, admin_notifications | ✅ | index.html |
| المهام (تنسيق الأعمال) | admin_tasks | ✅ | ✅ tasks.html |
| **السيارات** | admin_vehicles (+insurance_expiry) | ✅ | ✅ **vehicles.html (جديد)** |
| المشتريات | admin_purchases, admin_suppliers, admin_price_offers | ✅ | ❌ لسه "قريبًا" |
| استلام/تسليم الأعمال | admin_handovers | ✅ | ❌ مفيش صفحة |
| إدارات أخرى (تواصل) | admin_correspondence | ✅ | ❌ مفيش صفحة |
| تطوير الأعمال والأفكار | admin_ideas | ✅ | ✅ ideas.html (⚠️ راجع قسم 2) |
| العقود | admin_contracts | ✅ | ✅ contracts.html |

**4 من 7 موديولات ليها واجهة شغّالة الآن: تنسيق الأعمال، السيارات، تطوير الأفكار، العقود.**
الباقي (المشتريات، استلام/تسليم الأعمال، التواصل بين الإدارات) لسه من غير واجهة.

## 4. تفاصيل بنية الجداول (كما هي فعليًا في القاعدة)
- admin_branches(id uuid, name, is_active, created_at)
- admin_notifications(id uuid, module, title, message, level, ref_table, ref_id, is_read, created_at)
- admin_tasks(id uuid, title, coordinated_with, priority[critical/important/deferrable],
  status[pending/deferred/done/transferred], notes, created_at, updated_at)
- admin_vehicles(id uuid, plate_number, car_type, branch_id→admin_branches, sequence_number,
  license_expiry, inspection_expiry, insurance_expiry [مضاف 2026-09-08], status[active/parked/
  for_sale/retired — الواجهة تعرضها بأسماء عربية، القاعدة تخزن 'active' افتراضيًا], notes,
  created_at, updated_at)
- admin_suppliers(id uuid, supplier_code bigint [تسلسلي تلقائي], name, activity, mobile,
  registration_date, created_at)
- admin_purchases(id uuid, purchase_date, purchase_type, supplier_id→admin_suppliers,
  branch_id→admin_branches, item_description, cost numeric, attachment_url, notes, created_at)
- admin_price_offers(id uuid, offer_name, offer_date, entity_name, status, notes, created_at)
- admin_handovers(id uuid, employee_name, direction, has_mobile, has_car, has_email,
  has_engineering, other_items, branch_id→admin_branches, handover_date, signed, notes, created_at)
- admin_correspondence(id uuid, subject, department, correspondence_date, status, notes, created_at)
- admin_ideas(id uuid, title, department, status[new/under_review/approved/rejected/implemented],
  notes, created_at, updated_at)
- admin_contracts(id uuid, contract_type, owner_name, branch_id→admin_branches, contract_date,
  expiry_date [إضافة زيادة عن التوصيف الأصلي], notes, created_at, updated_at)

## 5. منطق التنبيهات المتدرجة (تنفيذ فعلي مؤكَّد من الكود، client-side في كل الحالات)
- **المهام** (tasks.html): NOTIFY_UNFINISHED_AFTER_DAYS=2, NOTIFY_OVERDUE_AFTER_DAYS=7.
- **العقود** (contracts.html): تنبيه قبل 30 يوم من expiry_date.
- **السيارات** (vehicles.html): تنبيه قبل 30 يوم لكل من license_expiry/inspection_expiry/
  insurance_expiry مستقلًا عن بعض، + تنبيه "منتهي" عند تجاوز التاريخ.
- كل ده client-side (يُفحص عند فتح الصفحة)، **مش cron على السيرفر** — pg_cron extension متاحة
  في المشروع بس غير مُفعّلة.

## 6. ملفات المشروع (2026-09-08)
theme.css, layout.js, supabase.js, login.html, index.html, tasks.html, ideas.html,
contracts.html, **vehicles.html (جديد)**, admin_schema_step1.sql (فروع+إشعارات),
admin_schema_step2.sql (مهام), admin_schema_step3.sql (أفكار، توثيقي),
admin_schema_step4.sql (عقود، توثيقي), admin_schema_step5.sql (تصحيح عمود تأمين السيارات، توثيقي),
STEP1_README.md, STEP2_README.md.

**كل صفحة جديدة يجب أن تتبع نفس النمط**: تربط theme.css بسطر واحد، تستدعي initAdminPage() من
layout.js، وتستخدم دوال supabase.js العامة بدل عمل Supabase client مستقل.

## 7. سجل التصحيحات والإضافات — 2026-09-08
1. إصلاح إشارات "حراء للسياحة" في 6 ملفات (قسم 0-أ).
2. إضافة عمود insurance_expiry لجدول admin_vehicles (قسم 0-ب).
3. بناء موديول السيارات كاملًا (واجهة vehicles.html + ربط الروابط في كل الصفحات + كارت الإحصائيات
   في index.html) (قسم 0-ب).

## 8. الأولويات المفتوحة (بانتظار توجيه العميل/المستخدم)
1. أي الموديولات الثلاثة الباقية (المشتريات، استلام/تسليم الأعمال، التواصل بين الإدارات) يُبنى له
   واجهة الأول؟
2. الرجوع للعميل لتأكيد وجود/عدم وجود "شيت تاني" في موديول تطوير الأفكار (التسجيل الصوتي غير مكتمل).
3. تفعيل pg_cron لو العميل عايز فحص تنبيهات دوري تلقائي من السيرفر بدل الاعتماد على فتح الصفحة.
4. طباعة تقرير مفصّل للإدارة في موديول المشتريات (مطلوب صراحة في التسجيل الصوتي).

## 9. تنبيه تاريخي (لتفادي تكرار الخطأ)
في مرحلة سابقة، تم بناء مجموعة جداول موازية بأسماء مختلفة (tasks, task_notifications, cars,
car_notifications, suppliers, purchases, price_quotes, business_ideas, handover_forms,
interdepartmental_items, contracts) — **تم حذفها بالكامل** لأنها كانت مكررة وفارغة. لا داعي
لإعادة إنشائها. الجداول الصحيحة الوحيدة هي كل ما ببادئة admin_.
