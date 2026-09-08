# خطة تطوير اللوحة الإدارية — hraa-admin-dashboard

> **ملف توثيق حي** — أي محادثة جديدة يجب أن تقرأ هذا الملف أولاً.
> ⚠️ **المشروع الحقيقي والمعتمد هو الموجود في مستودع `QuickData-main`** (theme.css, layout.js, supabase.js, login.html, index.html, tasks.html، وملفات admin_schema_stepN.sql). أي عمل سابق في هذه المحادثة استخدم أسماء جداول مختلفة (`tasks`, `cars`, `suppliers`...) — **تم حذفه بالكامل من القاعدة في 2026-09-08** لأنه كان مكررًا وفارغًا ويسبب لبس. لا تُنشئ هذه الأسماء مرة أخرى.

## 1. معلومات المشروع (Supabase)
- اسم المشروع: **QuickData ProSoft V.1**
- project_id: `hecsuitrqtbzgbbjjtbf`
- Project URL: `https://hecsuitrqtbzgbbjjtbf.supabase.co`
- متصل مباشرة عبر Supabase MCP Connector — التنفيذ يتم مباشرة على القاعدة الفعلية.
- **كل الجداول ببادئة `admin_` وعمود `id` من نوع `uuid`** — هذا هو التوافق المطلوب لأي جدول جديد.

## 2. مصدر المتطلبات
تفريغ صوتي من الأستاذ محمد يصف 7 موديولات: المهام، السيارات، المشتريات (+موردين+عروض أسعار)، تطوير الأفكار، استلام/تسليم الأعمال، إدارات أخرى (تواصل بين الأقسام)، العقود.

## 3. حالة الموديولات الفعلية في القاعدة (مؤكَّدة بالفحص المباشر بتاريخ 2026-09-08)

| الموديول | الجدول | الحالة |
|---|---|---|
| الأساس (فروع + إشعارات مركزية) | `admin_branches`, `admin_notifications` | ✅ موجود |
| المهام (تنسيق الأعمال) | `admin_tasks` | ✅ موجود |
| السيارات | `admin_vehicles` | ✅ موجود |
| المشتريات | `admin_purchases`, `admin_suppliers`, `admin_price_offers` | ✅ موجود |
| استلام/تسليم الأعمال | `admin_handovers` | ✅ موجود |
| إدارات أخرى (تواصل) | `admin_correspondence` | ✅ موجود |
| **تطوير الأعمال والأفكار** | `admin_ideas` | ✅ موجود (بُني 2026-09-08) — صفحة `ideas.html` شغّالة |
| **العقود** | `admin_contracts` | ✅ موجود (بُني 2026-09-08) — صفحة `contracts.html` شغّالة |

**كل الـ 7 موديولات الأصلية اللي في التسجيل الصوتي بقى ليها جدول في القاعدة. الموديولات اللي معندهاش واجهة (صفحة .html) لسه: السيارات، المشتريات، استلام/تسليم الأعمال، إدارات أخرى (تواصل) — جداولها موجودة بس مفيش صفحة فعلية بتستخدمها غير tasks/ideas/contracts/index.**

## 4. تفاصيل بنية الجداول الموجودة (كما هي فعليًا في القاعدة)
- `admin_branches(id uuid, name, is_active, created_at)`
- `admin_notifications(id uuid, module, title, message, level, ref_table, ref_id, is_read, created_at)` — **جدول إشعارات مركزي واحد لكل الموديولات**، مش جدول منفصل لكل موديول.
- `admin_tasks(id uuid, title, coordinated_with, priority[critical/important/deferrable], status[pending/deferred/done/transferred], notes, created_at, updated_at)`
- `admin_vehicles(id uuid, plate_number, car_type, branch_id uuid→admin_branches, sequence_number, license_expiry, inspection_expiry, status, notes, created_at, updated_at)`
- `admin_suppliers(id uuid, supplier_code bigint, name, activity, mobile, registration_date, created_at)`
- `admin_purchases(id uuid, purchase_date, purchase_type, supplier_id uuid→admin_suppliers, branch_id uuid→admin_branches, item_description, cost numeric, attachment_url, notes, created_at)`
- `admin_price_offers(id uuid, offer_name, offer_date, entity_name, status, notes, created_at)`
- `admin_handovers(id uuid, employee_name, direction, has_mobile, has_car, has_email, has_engineering, other_items, branch_id uuid→admin_branches, handover_date, signed, notes, created_at)`
- `admin_correspondence(id uuid, subject, department, correspondence_date, status, notes, created_at)`
- `admin_ideas(id uuid, title, department, status[new/under_review/approved/rejected/implemented], notes, created_at, updated_at)` — **جديد 2026-09-08**
- `admin_contracts(id uuid, contract_type, owner_name, branch_id uuid→admin_branches, contract_date, expiry_date, notes, created_at, updated_at)` — **جديد 2026-09-08**. عمود `expiry_date` مضاف زيادة عن التوصيف الأصلي في الخطة (كان contract_type/owner_name/branch_id/contract_date/notes بس) عشان تُحسب حالة العقد (سارٍ/قارب على الانتهاء/منتهي) وتُبعت تنبيهات مركزية بنفس منطق باقي الموديولات.

## 5. ملفات المشروع الحقيقي (من QuickData-main.zip المرفوع، ومحدَّثة بتاريخ 2026-09-08)
`theme.css` (تصميم موحّد: سايدبار، وضع ليلي، جداول، مودالز، توست)، `layout.js` (سلوكيات مشتركة + `initAdminPage()`)، `supabase.js` (طبقة اتصال عامة: fetchData/addData/updateData/deleteData)، `login.html`, `index.html` (سايدبار + كروت إحصائية + إدارة الفروع)، `tasks.html`، `admin_schema_step1.sql`, `admin_schema_step2.sql`، `admin_schema_step3.sql` (admin_ideas)، `ideas.html`، وأضيف حديثًا: `admin_schema_step4.sql` (SQL توثيقي لجدول admin_contracts) و`contracts.html` (صفحة العقود الفعلية الشغالة — تبويبات: الكل/سارية/قاربت على الانتهاء/منتهية، مع تنبيهات تلقائية في admin_notifications قبل 30 يوم من الانتهاء).
تم تحديث `index.html`, `tasks.html`, `ideas.html`: رابط "العقود" في السايدبار (وكارت الاختصار السريع في index.html) بقى يودّي فعليًا لـ `contracts.html` بدل "قريبًا".
**كل صفحة جديدة يجب أن تتبع نفس النمط**: تربط `theme.css` بسطر واحد، تستدعي `initAdminPage()` من `layout.js`، وتستخدم دوال `supabase.js` العامة بدل عمل Supabase client مستقل.

## 6. حالة المشروع الحالية
كل الـ 7 موديولات من التسجيل الصوتي بقى ليها جدول في القاعدة، و**3 موديولات ليها واجهة فعلية شغّالة**: تنسيق الأعمال (`tasks.html`)، تطوير الأفكار (`ideas.html`)، العقود (`contracts.html`) — بالإضافة لـ `index.html` (الأساس + إدارة الفروع).

الموديولات اللي جداولها موجودة بس **من غير واجهة (.html) بعد**:
- السيارات (`admin_vehicles`)
- المشتريات (`admin_purchases`, `admin_suppliers`, `admin_price_offers`)
- استلام/تسليم الأعمال (`admin_handovers`)
- إدارات أخرى / تواصل بين الأقسام (`admin_correspondence`)

**بانتظار توجيه المستخدم: أي موديول من الأربعة اللي فوق يتبنى له واجهة الأول، أو أولوية أخرى (تحسين صفحة موجودة، ربط الإشعارات المركزية بشكل أوضح في الواجهة، إلخ).**

## 7. تنبيه تاريخي (لتفادي تكرار الخطأ)
في مرحلة سابقة من هذه المحادثة، تم بناء مجموعة جداول موازية بأسماء مختلفة (`tasks`, `task_notifications`, `cars`, `car_notifications`, `suppliers`, `purchases`, `price_quotes`, `business_ideas`, `handover_forms`, `interdepartmental_items`, `contracts`) ودوال (`set_updated_at`, `check_overdue_tasks`, `check_car_expirations`) وview (`all_notifications`) — **كل هذا تم حذفه بالكامل** بعد اكتشاف وجود المشروع الحقيقي `admin_*`. كانت فارغة تمامًا (صفر صفوف) وقت الحذف. لا داعي لإعادة إنشائها.
