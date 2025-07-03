import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "../firebase-init.js";

// دالة مساعدة لعرض الأخطاء
function showError(element, message) {
  element.textContent = message;
}

// صفحة تسجيل الدخول
if (document.getElementById('loginForm')) {
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    try {
      const q = query(collection(db, 'members'), where('phone', '==', phone));
      const snap = await getDocs(q);
      if (snap.empty) {
        showError(errorEl, 'المستخدم غير موجود');
        return;
      }
      const docData = snap.docs[0];
      const data = docData.data();
      const match = await bcrypt.compare(password, data.passwordHash);
      if (!match) {
        showError(errorEl, 'كلمة المرور غير صحيحة');
        return;
      }
      localStorage.setItem('memberId', docData.id);
      location.href = 'dashboard.html';
    } catch (err) {
      showError(errorEl, 'حدث خطأ، حاول لاحقًا');
      console.error(err);
    }
  });
}

// صفحة لوحة العضو
if (document.getElementById('checkIn')) {
  const memberId = localStorage.getItem('memberId');
  if (!memberId) {
    location.href = 'index.html';
  }

  const checkInBtn = document.getElementById('checkIn');
  const checkOutBtn = document.getElementById('checkOut');
  const statusEl = document.getElementById('status');
  const logoutBtn = document.getElementById('logout');
  const clockEl = document.getElementById('clock');

  // تحديث الساعة كل ثانية
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('ar-EG');
  }, 1000);

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('memberId');
    location.href = 'index.html';
  });

  const todayId = () => {
    const d = new Date();
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
    return `${memberId}_${ymd}`;
  };

  async function loadStatus() {
    const docRef = doc(db, 'attendance', todayId());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.in) {
        checkInBtn.disabled = true;
        statusEl.textContent = 'تم تسجيل الدخول';
      }
      if (data.out) {
        checkOutBtn.disabled = true;
        statusEl.textContent = 'تم تسجيل الخروج';
      }
    }
  }

  loadStatus();

  checkInBtn.addEventListener('click', async () => {
    try {
      const docRef = doc(db, 'attendance', todayId());
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          memberId,
          in: serverTimestamp(),
          out: null
        });
        statusEl.textContent = 'تم تسجيل الدخول';
        checkInBtn.disabled = true;
        loadStatus();
      } else {
        const data = docSnap.data();
        if (!data.in) {
          await setDoc(docRef, { memberId, in: serverTimestamp() }, { merge: true });
          statusEl.textContent = 'تم تسجيل الدخول';
          checkInBtn.disabled = true;
          loadStatus();
        }
      }
    } catch (err) {
      statusEl.textContent = 'تعذر التسجيل';
      console.error(err);
    }
  });

  checkOutBtn.addEventListener('click', async () => {
    try {
      const docRef = doc(db, 'attendance', todayId());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.in && !data.out) {
          await setDoc(docRef, { out: serverTimestamp() }, { merge: true });
          statusEl.textContent = 'تم تسجيل الخروج';
          checkOutBtn.disabled = true;
          loadStatus();
        }
      }
    } catch (err) {
      statusEl.textContent = 'تعذر التسجيل';
      console.error(err);
    }
  });
}
