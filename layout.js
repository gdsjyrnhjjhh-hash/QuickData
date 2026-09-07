/* ================================================================
   اللوحة الإدارية — حراء للسياحة
   سلوكيات مشتركة لكل صفحات اللوحة (Layout Helpers)
   مستخرجة من نفس منطق index.html الأصلي في نظام حراء للسياحة
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
// الموجودة أصلاً في supabase.js المشترك مع نظام حراء للسياحة)
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
    if (userRole) userRole.textContent = (currentUser.user_metadata && currentUser.user_metadata.role) || 'حراء للسياحة';
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
