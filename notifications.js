import { supabase } from './supabase.js';

// --- فتح وإغلاق القائمة الجانبية ---
window.openMenu = () => document.getElementById("sideMenu")?.classList.add("open");
window.closeMenu = () => document.getElementById("sideMenu")?.classList.remove("open");

// --- إنشاء إشعار ---
function notify(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// --- إضافة بطاقة إشعار للواجهة ---
function appendNotificationCard(req, state = "unread") {
  const container = document.getElementById("notificationsContainer");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  const card = document.createElement("div");
  card.className = `notif ${state}`;
  card.innerHTML = `
    <div class="title">${req.title || "طلب دم"} - ${req.blood_type || ""}</div>
    <div class="actions">
      <button class="btn btn-secondary mark-read">تحديد كمقروء</button>
    </div>
    <div class="time">الآن</div>
  `;

  card.querySelector('.mark-read')?.addEventListener('click', e => {
    e.stopPropagation();
    card.classList.remove('unread');
    card.classList.add('read');
  });

  container.prepend(card);
  emptyState?.classList.toggle("hidden", container.children.length > 0);
}

// --- معالجة طلب جديد ---
function handleNewRequest(req) {
  // إرسال إشعار دائمًا
  notify(
    `🚨 طلب دم جديد`,
    `فصيلة الدم: ${req.blood_type || "-"}\nالجهة: ${req.hospital || req.full_name || "-"}`
  );
  appendNotificationCard(req, "unread");
}

// --- بعد تحميل الصفحة ---
document.addEventListener("DOMContentLoaded", async () => {
  if ("Notification" in window) Notification.requestPermission();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const userId = session.user.id;

  const { data: userData } = await supabase
    .from("login")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const userType = userData?.account_type || "";

  // جلب الطلبات الحالية
  const { data: requests } = await supabase
    .from("emergency_requests")
    .select("*")
    .order("created_at", { ascending: false });

  requests?.forEach(req => handleNewRequest(req));

  // الاشتراك في التحديثات الفورية
  supabase
    .channel('realtime-emergency')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_requests' }, payload => {
      handleNewRequest(payload.new);
    })
    .subscribe();

  // التحكم في التبويبات
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      const items = document.querySelectorAll('.notif');
      items.forEach(item => {
        if (filter === 'all') item.style.display = '';
        if (filter === 'unread') item.style.display = item.classList.contains('unread') ? '' : 'none';
        if (filter === 'read') item.style.display = item.classList.contains('read') ? '' : 'none';
      });
      const emptyState = document.getElementById("emptyState");
      emptyState?.classList.toggle("hidden", document.querySelectorAll('.notif:not([style*="display: none"])').length > 0);
    });
  });

  // زر تمييز الكل كمقروء
  document.getElementById('markAllRead')?.addEventListener('click', () => {
    document.querySelectorAll('.notif.unread').forEach(item => {
      item.classList.remove('unread');
      item.classList.add('read');
    });
  });

  // تفعيل إشعارات المتصفح
  document.getElementById('enableBrowserNotifications')?.addEventListener('click', async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') alert('تم تفعيل إشعارات المتصفح');
    } catch {}
  });
});
