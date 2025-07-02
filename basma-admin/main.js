import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot
} from "../firebase-init.js";

// دالة مساعدة لعرض الأخطاء
function showError(element, message) {
  element.textContent = message;
}

// تسجيل دخول المدير
if (document.getElementById('adminLoginForm')) {
  const form = document.getElementById('adminLoginForm');
  const errorEl = document.getElementById('adminError');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('adminPassword').value;
    try {
      const docRef = doc(db, 'admins', 'bootstrap');
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        showError(errorEl, 'لا يوجد حساب مدير');
        return;
      }
      const data = snap.data();
      if (data.username !== username) {
        showError(errorEl, 'المستخدم غير موجود');
        return;
      }
      const ok = await bcrypt.compare(password, data.passwordHash);
      if (!ok) {
        showError(errorEl, 'كلمة المرور غير صحيحة');
        return;
      }
      localStorage.setItem('isAdmin', 'true');
      location.href = 'users.html';
    } catch (err) {
      showError(errorEl, 'حدث خطأ');
      console.error(err);
    }
  });
}

// التحقق من صلاحية المدير
function requireAdmin() {
  if (localStorage.getItem('isAdmin') !== 'true') {
    location.href = 'index.html';
  }
}

// صفحة إدارة الأعضاء
if (document.getElementById('membersTable')) {
  requireAdmin();
  const tableBody = document.querySelector('#membersTable tbody');
  const addBtn = document.getElementById('addUser');
  const modal = document.getElementById('userModal');
  const cancelBtn = document.getElementById('cancelUser');
  const form = document.getElementById('userForm');
  const modalTitle = document.getElementById('modalTitle');
  const logoutBtn = document.getElementById('logoutAdmin');

  let editId = null;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    location.href = 'index.html';
  });

  function openModal(id, data) {
    editId = id;
    modalTitle.textContent = id ? 'تعديل عضو' : 'عضو جديد';
    form.fullName.value = data ? data.fullName : '';
    form.userPhone.value = data ? data.phone : '';
    form.userPassword.value = '';
    modal.classList.remove('hidden');
  }

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  addBtn.addEventListener('click', () => openModal(null, null));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = form.fullName.value.trim();
    const phone = form.userPhone.value.trim();
    const password = form.userPassword.value;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      if (editId) {
        await updateDoc(doc(db, 'members', editId), { fullName, phone, passwordHash });
      } else {
        const docRef = doc(collection(db, 'members'));
        await setDoc(docRef, {
          fullName,
          phone,
          passwordHash,
          createdAt: serverTimestamp()
        });
      }
      modal.classList.add('hidden');
    } catch (err) {
      console.error(err);
    }
  });

  async function deleteMember(id) {
    if (!confirm('حذف العضو؟')) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      const q = query(collection(db, 'attendance'), where('memberId', '==', id));
      const snaps = await getDocs(q);
      for (const d of snaps.docs) {
        await deleteDoc(doc(db, 'attendance', d.id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  onSnapshot(collection(db, 'members'), (snapshot) => {
    tableBody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${data.fullName}</td><td>${data.phone}</td>`;
      const actions = document.createElement('td');
      const editB = document.createElement('button');
      editB.textContent = 'تعديل';
      editB.onclick = () => openModal(docSnap.id, data);
      const delB = document.createElement('button');
      delB.textContent = 'حذف';
      delB.onclick = () => deleteMember(docSnap.id);
      actions.appendChild(editB);
      actions.appendChild(delB);
      tr.appendChild(actions);
      tableBody.appendChild(tr);
    });
  });
}

// صفحة الحضور
if (document.getElementById('attTable')) {
  requireAdmin();
  const tableBody = document.querySelector('#attTable tbody');
  const dateInput = document.getElementById('attDate');
  const backBtn = document.getElementById('backUsers');

  backBtn.addEventListener('click', () => {
    location.href = 'users.html';
  });

  dateInput.valueAsNumber = Date.now() - (new Date()).getTimezoneOffset() * 60000;

  function loadAttendance() {
    const d = new Date(dateInput.value);
    const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
    const q = query(collection(db, 'attendance'), where('memberId', '>=', '' ));
    onSnapshot(q, async (snap) => {
      tableBody.innerHTML = '';
      const memberMap = {};
      const members = await getDocs(collection(db, 'members'));
      members.forEach(m => memberMap[m.id] = m.data().fullName);
      snap.forEach(docSnap => {
        if (docSnap.id.endsWith(ymd)) {
          const data = docSnap.data();
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${memberMap[data.memberId] || ''}</td>` +
            `<td>${data.in ? new Date(data.in.seconds*1000).toLocaleTimeString('ar-EG') : ''}</td>`+
            `<td>${data.out ? new Date(data.out.seconds*1000).toLocaleTimeString('ar-EG') : ''}</td>`;
          tableBody.appendChild(tr);
        }
      });
    });
  }

  dateInput.addEventListener('change', loadAttendance);
  loadAttendance();
}
