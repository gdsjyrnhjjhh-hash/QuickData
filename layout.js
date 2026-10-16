/* ================================================================
   اللوحة الإدارية — QuickData
   سلوكيات مشتركة لكل صفحات اللوحة (Layout Helpers)
   يعتمد على وجود supabase.js قبله في الصفحة
   ================================================================ */

// ================================================================
// تبديل القائمة الجانبية
// موبايل (max-width: 1200px): تظهر فوق المحتوى (open/overlay)
// ديسكتوب: تطوي بجانب المحتوى (collapsed/expanded)
// ================================================================
function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('sidebarToggle');
    var main = document.getElementById('mainContent');
    var overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !toggle || !main || !overlay) return;

    var MOBILE_BREAKPOINT = 1200;

    toggle.addEventListener('click', function() {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            var isOpen = sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        } else {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        }
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            sidebar.classList.remove('collapsed');
            main.classList.remove('expanded');
        }
    });
}

// ================================================================
// الوضع الليلي (يعتمد على Supabase.isDarkModeEnabled / applyTheme / toggleTheme
// الموجودة في supabase.js)
// ================================================================
function initDarkMode() {
    var toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    var icon = toggle.querySelector('i');
    var isDark = false;
    try { isDark = Supabase.isDarkModeEnabled(); Supabase.applyTheme(isDark); } catch (e) { /* تجاهل */ }

    if (icon) icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';

    toggle.addEventListener('click', function() {
        var currentState = document.body.classList.contains('dark-mode');
        var newState = !currentState;
        try {
            Supabase.toggleTheme(newState).then(function() {
                if (icon) icon.className = newState ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            });
        } catch (e) {
            document.body.classList.toggle('dark-mode', newState);
            localStorage.setItem('darkMode', newState ? 'true' : 'false');
            if (icon) icon.className = newState ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
    });
}

// تطبيق الوضع الليلي فور تحميل الصفحة (قبل ما تترسم) لتفادي "الوميض"
(function() {
    try {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark-mode-pending');
        }
    } catch (e) { /* تجاهل */ }
})();

// ================================================================
// اختصارات لوحة المفاتيح
// ================================================================
function initKeyboardShortcuts(onRefresh) {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            var t = document.getElementById('sidebarToggle');
            if (t) t.click();
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (typeof onRefresh === 'function') onRefresh();
            showToast('🔄 جاري تحديث البيانات...', 'info');
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            var d = document.getElementById('darkModeToggle');
            if (d) d.click();
        }
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            logout();
        }
    });
}

// ================================================================
// تحديث اسم/دور/صورة المستخدم الحالي في الهيدر
// ================================================================
function updateUserUI(currentUser) {
    if (!currentUser) return;
    var userName = document.getElementById('userName');
    var userRole = document.getElementById('userRole');
    var userAvatar = document.getElementById('userAvatar');

    var fullName = (currentUser.user_metadata && currentUser.user_metadata.full_name) || currentUser.email || 'مستخدم';

    if (userName) userName.textContent = fullName;
    if (userRole) userRole.textContent = (currentUser.user_metadata && currentUser.user_metadata.role) || 'QuickData';
    if (userAvatar) userAvatar.textContent = fullName.charAt(0).toUpperCase();
}

// ================================================================
// عرض التاريخ الحالي بالهيدر
// ================================================================
function updateDate() {
    var now = new Date();
    var options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    var dateElement = document.getElementById('headerDate');
    if (dateElement) dateElement.textContent = now.toLocaleDateString('ar-SA', options);
}

// ================================================================
// تسجيل الخروج
// ================================================================
function logout() {
    if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('darkMode');
    window.location.href = 'login.html';
}

// ================================================================
// نظام التنبيهات (Toast) الموحّد
// ================================================================
function showToast(message, type) {
    var existingToasts = document.querySelectorAll('.toast-notification');
    for (var i = 0; i < existingToasts.length; i++) existingToasts[i].remove();

    var toast = document.createElement('div');
    toast.className = 'toast-notification';

    var iconClass = 'bi-info-circle-fill';
    var toastClass = '';

    if (type === 'success') { iconClass = 'bi-check-circle-fill'; toastClass = 'toast-success'; }
    else if (type === 'error') { iconClass = 'bi-x-circle-fill'; toastClass = 'toast-error'; }
    else if (type === 'warning') { iconClass = 'bi-exclamation-triangle-fill'; toastClass = 'toast-warning'; }

    toast.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;">' +
            '<i class="bi ' + iconClass + '" style="font-size:14px;color:var(--accent-light);"></i>' +
            '<span style="font-size:12.5px;font-weight:500;">' + message + '</span>' +
        '</div>';

    if (toastClass) toast.classList.add(toastClass);

    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// ================================================================
// عرض/إخفاء المودالز (نمط موحّد data-modal)
// ================================================================
function openModalById(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
}
function closeModalById(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

// ================================================================
// إعداد صفحة موحّد: يُستدعى مرة واحدة في كل صفحة بعد DOMContentLoaded
// يتأكد من تسجيل الدخول، يفعّل السايدبار والوضع الليلي والاختصارات،
// ويحدّث بيانات المستخدم والتاريخ في الهيدر
// ================================================================
function initAdminPage(options) {
    options = options || {};

    if (!Supabase.isLoggedIn()) {
        window.location.href = 'login.html';
        return null;
    }

    var currentUser = null;
    try { currentUser = Supabase.getCurrentUser(); } catch (e) { /* تجاهل */ }

    updateUserUI(currentUser);
    updateDate();
    initSidebar();
    initDarkMode();
    initKeyboardShortcuts(options.onRefresh);

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn && typeof options.onRefresh === 'function') {
        refreshBtn.addEventListener('click', function() {
            options.onRefresh();
            showToast('🔄 جاري تحديث البيانات...', 'info');
        });
    }

    return currentUser;
}

window.logout = logout;
window.showToast = showToast;


// ================================================================
// تصدير أي تقرير إلى PDF  +  نسخة احتياطية كاملة إلى Excel
// (المكتبات بتتحمّل من cdnjs وقت الحاجة بس)
// ================================================================
var HTML2PDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
var XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
var _scriptPromises = {};

function loadScriptOnce(src) {
    if (_scriptPromises[src]) return _scriptPromises[src];
    _scriptPromises[src] = new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = function() { delete _scriptPromises[src]; reject(new Error('تعذّر تحميل ' + src)); };
        document.head.appendChild(s);
    });
    return _scriptPromises[src];
}

// ---------------- PDF ----------------
// بيضيف زر "PDF" جنب كل زر "طباعة" في النظام، وبيطلع نفس التقرير اللي بتطبعه (بالفلتر/التبويب الحالي)
function injectPdfButtons() {
    document.querySelectorAll('.btn-print').forEach(function(btn) {
        if (btn.dataset.pdfAdded) return;
        btn.dataset.pdfAdded = '1';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = btn.className + ' btn-pdf no-print';
        b.dataset.pdfAdded = '1';
        b.style.marginInlineStart = '6px';
        b.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> PDF';
        b.addEventListener('click', function() { exportReportPDF(btn); });
        btn.parentNode.insertBefore(b, btn.nextSibling);
    });
}

var _pdfBusy = false;
async function exportReportPDF(printBtn) {
    if (_pdfBusy) return;
    _pdfBusy = true;
    showToast('جاري تجهيز ملف PDF...', 'info');
    var wasDark = document.body.classList.contains('dark-mode');
    var origPrint = window.print;
    try {
        await loadScriptOnce(HTML2PDF_URL);

        // نشغّل دالة الطباعة الأصلية للصفحة (بتجهّز عنوان التقرير) لكن نمنع نافذة الطباعة
        window.print = function() {};
        try { printBtn.click(); } catch (e) { console.error(e); }
        window.print = origPrint;

        var header = document.querySelector('.print-report-header h2');
        var title = (header && header.textContent.trim()) || document.title;
        var fileName = title.replace(/[\\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim() + ' - ' + new Date().toISOString().slice(0, 10) + '.pdf';

        if (wasDark) document.body.classList.remove('dark-mode');
        document.body.classList.add('pdf-capture');
        window.scrollTo(0, 0);

        var el = document.querySelector('.dashboard-content');
        await html2pdf().set({
            margin: [8, 8, 8, 8],
            filename: fileName,
            image: { type: 'jpeg', quality: 0.96 },
            html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, windowWidth: 1280 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.stat-card'] }
        }).from(el).save();
        showToast('✅ تم إنشاء ملف PDF', 'success');
    } catch (e) {
        console.error(e);
        showToast('تعذّر إنشاء PDF — تأكد من الاتصال بالإنترنت وحاول تاني', 'error');
    } finally {
        window.print = origPrint;
        document.body.classList.remove('pdf-capture');
        if (wasDark) document.body.classList.add('dark-mode');
        _pdfBusy = false;
    }
}

// ---------------- نسخة احتياطية Excel ----------------
// [اسم الجدول في القاعدة، اسم الصفحة (الشيت) في الإكسيل]
var BACKUP_TABLES = [
    ['admin_tasks', 'تنسيق الأعمال'],
    ['admin_vehicles', 'السيارات'],
    ['admin_traffic_fines', 'مخالفات السيارات'],
    ['admin_housing', 'السكن'],
    ['admin_purchases', 'المشتريات'],
    ['admin_suppliers', 'الموردين'],
    ['admin_price_offers', 'عروض الأسعار'],
    ['admin_handovers', 'استلام وتسليم الأعمال'],
    ['admin_correspondence', 'التواصل بين الإدارات'],
    ['admin_ideas', 'تطوير الأفكار'],
    ['admin_other_notes', 'تطوير - أخرى'],
    ['admin_contracts', 'العقود'],
    ['admin_branches', 'الفروع'],
    ['admin_notifications', 'الإشعارات']
];

// عناوين أعمدة بالعربي (أي عمود مش هنا بيفضل باسمه الأصلي)
var BACKUP_COLS_AR = {
    id: 'المعرّف', serial_no: 'رقم مسلسل', created_at: 'تاريخ الإنشاء', updated_at: 'آخر تعديل',
    title: 'العنوان', name: 'الاسم', notes: 'ملاحظات', status: 'الحالة', priority: 'الأولوية',
    department: 'القسم', subject: 'الموضوع', body: 'نص المخاطبة', content: 'المحتوى',
    coordinated_with: 'الجهة المنسّقة', branch_id: 'الفرع', is_active: 'نشط',
    plate_number: 'رقم اللوحة', car_type: 'نوع السيارة', sequence_number: 'الرقم التسلسلي',
    chassis_number: 'رقم الهيكل', license_expiry: 'انتهاء الاستمارة', insurance_expiry: 'انتهاء التأمين',
    status_other: 'ملاحظة حالة "أخرى"',
    housing_name: 'اسم السكن', room_number: 'رقم الغرفة', employee_name: 'اسم الموظف', room_contents: 'محتويات الغرفة',
    violation_name: 'اسم المخالفة', violation_date: 'تاريخ المخالفة', violator_name: 'مرتكب المخالفة',
    amount: 'المبلغ', deduction_method: 'طريقة الخصم', is_deducted: 'تم الخصم',
    correspondence_date: 'تاريخ المخاطبة',
    owner_name: 'اسم المالك', contract_date: 'تاريخ العقد', contract_type: 'نوع العقد', expiry_date: 'تاريخ الانتهاء',
    is_read: 'مقروء', level: 'المستوى', message: 'الرسالة', module: 'الموديول', ref_id: 'معرّف المرجع', ref_table: 'جدول المرجع'
};

function backupCell(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'نعم' : 'لا';
    if (typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
        var d = new Date(v);
        if (!isNaN(d)) {
            var p = function(n) { return (n < 10 ? '0' : '') + n; };
            return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
        }
    }
    return v;
}

async function backupFetchAll(table) {
    var rows = [], size = 1000, offset = 0, order = '&order=created_at.asc';
    var base = Supabase.CONFIG.URL + '/rest/v1/' + table + '?select=*';
    while (true) {
        var r = await fetch(base + order + '&limit=' + size + '&offset=' + offset, { headers: getHeaders(true) });
        if (!r.ok && order) { // جدول من غير created_at → نجرّب من غير ترتيب
            order = '';
            r = await fetch(base + '&limit=' + size + '&offset=' + offset, { headers: getHeaders(true) });
        }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var chunk = await r.json();
        rows = rows.concat(chunk);
        if (chunk.length < size) break;
        offset += size;
    }
    return rows;
}

var _backupBusy = false;
async function backupAllToExcel() {
    if (_backupBusy) return;
    _backupBusy = true;
    var link = document.getElementById('backupNavBtn');
    if (link) link.style.opacity = '0.6';
    try {
        showToast('⏳ جاري سحب البيانات للنسخة الاحتياطية...', 'info');
        await loadScriptOnce(XLSX_URL);

        var wb = XLSX.utils.book_new();
        wb.Workbook = { Views: [{ RTL: true }] };
        var summary = [['الصفحة (الشيت)', 'الجدول في القاعدة', 'عدد السجلات', 'الحالة']];
        var sheets = [];
        var totalRows = 0, failed = 0;

        for (var i = 0; i < BACKUP_TABLES.length; i++) {
            var table = BACKUP_TABLES[i][0], sheetName = BACKUP_TABLES[i][1];
            try {
                var rows = await backupFetchAll(table);
                var keys = [];
                rows.forEach(function(r) { Object.keys(r).forEach(function(k) { if (keys.indexOf(k) === -1) keys.push(k); }); });
                // المعرّف في آخر الأعمدة عشان الشيت يبدأ بالبيانات المفيدة
                if (keys.indexOf('id') !== -1) { keys.splice(keys.indexOf('id'), 1); keys.push('id'); }
                var aoa = [keys.map(function(k) { return BACKUP_COLS_AR[k] || k; })];
                rows.forEach(function(r) { aoa.push(keys.map(function(k) { return backupCell(r[k]); })); });
                if (!rows.length) aoa.push(['لا توجد بيانات']);
                sheets.push({ name: sheetName, aoa: aoa });
                summary.push([sheetName, table, rows.length, 'تم']);
                totalRows += rows.length;
            } catch (e) {
                console.warn('⚠️ فشل نسخ ' + table, e);
                failed++;
                summary.push([sheetName, table, 0, 'تعذّر السحب (الجدول غير موجود أو لا توجد صلاحية)']);
            }
        }

        summary.unshift([]);
        summary.unshift(['تاريخ النسخة', new Date().toLocaleString('ar-EG')]);
        summary.unshift(['النسخة الاحتياطية — اللوحة الإدارية QuickData']);
        sheets.unshift({ name: 'ملخص النسخة', aoa: summary });

        sheets.forEach(function(sh) {
            var ws = XLSX.utils.aoa_to_sheet(sh.aoa);
            var cols = [];
            sh.aoa.forEach(function(row) {
                row.forEach(function(cell, c) {
                    var len = String(cell === null || cell === undefined ? '' : cell).split('\n').reduce(function(m, l) { return Math.max(m, l.length); }, 0);
                    cols[c] = Math.max(cols[c] || 10, Math.min(60, len + 2));
                });
            });
            ws['!cols'] = cols.map(function(w) { return { wch: w }; });
            if (sh.name !== 'ملخص النسخة' && sh.aoa.length > 1 && sh.aoa[0].length) {
                ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sh.aoa.length - 1, c: sh.aoa[0].length - 1 } }) };
            }
            XLSX.utils.book_append_sheet(wb, ws, sh.name.replace(/[\[\]:*?\/\\]/g, '-').slice(0, 31));
        });

        var d = new Date(), p2 = function(n) { return (n < 10 ? '0' : '') + n; };
        var stamp = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '_' + p2(d.getHours()) + p2(d.getMinutes());
        XLSX.writeFile(wb, 'QuickData-backup-' + stamp + '.xlsx');
        showToast('✅ تم تنزيل النسخة الاحتياطية (' + totalRows + ' سجل' + (failed ? ' — تعذّر ' + failed + ' جدول' : '') + ')', failed ? 'warning' : 'success');
    } catch (e) {
        console.error(e);
        showToast('فشلت النسخة الاحتياطية — تأكد من الاتصال بالإنترنت وحاول تاني', 'error');
    } finally {
        _backupBusy = false;
        if (link) link.style.opacity = '';
    }
}

// زر النسخة الاحتياطية في القائمة الجانبية لكل الصفحات
function injectBackupButton() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav || document.getElementById('backupNavBtn')) return;
    var t = document.createElement('div');
    t.className = 'nav-section-title';
    t.textContent = 'النظام';
    var ul = document.createElement('ul');
    ul.className = 'nav-list';
    ul.innerHTML = '<li><a href="#" id="backupNavBtn"><i class="bi bi-cloud-arrow-down-fill"></i> نسخة احتياطية (Excel)</a></li>';
    nav.appendChild(t);
    nav.appendChild(ul);
    document.getElementById('backupNavBtn').addEventListener('click', function(e) {
        e.preventDefault();
        backupAllToExcel();
    });
}

function initExtras() { injectPdfButtons(); injectBackupButton(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initExtras);
else initExtras();

window.exportReportPDF = exportReportPDF;
window.backupAllToExcel = backupAllToExcel;
