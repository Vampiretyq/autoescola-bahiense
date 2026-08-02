// ===================== DADOS (armazenados no navegador) =====================
const DB = {
  seed() {
    if (!localStorage.getItem('bahiense_students')) {
      const students = [
        { id: 's1', name: 'Ana Beatriz Souza', cpf: '12345678900', phone: '(71) 99999-0001', category: 'B', password: 'demo123' }
      ];
      localStorage.setItem('bahiense_students', JSON.stringify(students));
    }
    if (!localStorage.getItem('bahiense_lessons')) {
      const lessons = [
        { id: 'l1', studentId: 's1', type: 'Prática', date: '2026-08-05', time: '08:00', instructor: 'Cláudio', status: 'confirmada' },
        { id: 'l2', studentId: 's1', type: 'Prática', date: '2026-08-07', time: '09:30', instructor: 'Cláudio', status: 'concluida' },
        { id: 'l3', studentId: 's1', type: 'Exame DETRAN', date: '2026-08-20', time: '17:30', instructor: '—', status: 'agendada' }
      ];
      localStorage.setItem('bahiense_lessons', JSON.stringify(lessons));
    }
  },
  getStudents() { return JSON.parse(localStorage.getItem('bahiense_students') || '[]'); },
  saveStudents(list) { localStorage.setItem('bahiense_students', JSON.stringify(list)); },
  getLessons() { return JSON.parse(localStorage.getItem('bahiense_lessons') || '[]'); },
  saveLessons(list) { localStorage.setItem('bahiense_lessons', JSON.stringify(list)); },
  uid() { return 'id' + Math.random().toString(36).slice(2, 9); }
};
DB.seed();

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const shown = links.style.display === 'flex';
      links.style.display = shown ? 'none' : 'flex';
      links.style.cssText += shown ? '' : 'position:absolute;top:70px;left:0;right:0;background:var(--asphalt-900);flex-direction:column;padding:20px 28px;border-bottom:1px solid var(--asphalt-line);gap:16px;align-items:flex-start;';
    });
  }

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (isOpen) { item.classList.remove('open'); a.style.maxHeight = null; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  // ---------- Tabs genéricas (usadas no admin) ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs');
      const target = btn.dataset.tab;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });

  // ================= LOGIN DO ALUNO (login.html) =================
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    const userField = document.querySelector('#field-user');
    const passField = document.querySelector('#field-pass');
    const loginWrap = document.querySelector('#login-wrap');
    const portal = document.querySelector('#portal');
    const greet = document.querySelector('#portal-greet');
    const logoutBtn = document.querySelector('#logout-btn');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const cpfVal = userField.querySelector('input').value.trim().replace(/\D/g, '');
      const passVal = passField.querySelector('input').value.trim();

      if (cpfVal.length < 3) { userField.classList.add('invalid'); valid = false; }
      else userField.classList.remove('invalid');

      if (passVal.length < 3) { passField.classList.add('invalid'); valid = false; }
      else passField.classList.remove('invalid');

      if (!valid) return;

      const students = DB.getStudents();
      const student = students.find(s => s.cpf === cpfVal && s.password === passVal);

      if (!student) {
        passField.classList.add('invalid');
        passField.querySelector('.field-error').textContent = 'CPF ou senha incorretos. (Aluno demo: CPF 12345678900, senha demo123)';
        return;
      }

      renderPortal(student);
      loginWrap.classList.add('hidden');
      portal.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        portal.classList.remove('show');
        loginWrap.classList.remove('hidden');
        loginForm.reset();
        userField.classList.remove('invalid');
        passField.classList.remove('invalid');
      });
    }
  }

  function renderPortal(student) {
    const lessons = DB.getLessons().filter(l => l.studentId === student.id);
    const total = lessons.length;
    const done = lessons.filter(l => l.status === 'concluida').length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    document.querySelector('#portal-greet').textContent = 'Bem-vindo(a), ' + student.name.split(' ')[0] + '!';
    document.querySelector('#portal-sub').textContent = 'Categoria ' + student.category + ' · ' + student.phone;
    document.querySelector('#portal-pct').textContent = pct + '%';
    document.querySelector('#portal-bar').style.width = pct + '%';
    document.querySelector('#portal-done').textContent = done;
    document.querySelector('#portal-left').textContent = Math.max(total - done, 0);

    const list = document.querySelector('#portal-lessons');
    list.innerHTML = '';
    if (!lessons.length) {
      list.innerHTML = '<div class="empty-state">Nenhuma aula cadastrada ainda.</div>';
      return;
    }
    lessons.forEach(l => {
      const row = document.createElement('div');
      row.className = 'lesson-row';
      const badgeClass = l.status === 'concluida' || l.status === 'confirmada' ? 'ok' : '';
      row.innerHTML = `
        <span class="lesson-time">${formatDate(l.date)}</span>
        <span class="avatar">${l.instructor.slice(0,2).toUpperCase()}</span>
        <div class="lesson-info"><div class="name">${l.type}</div><div class="meta">${l.time} · Instrutor: ${l.instructor}</div></div>
        <span class="badge ${badgeClass}">${l.status}</span>`;
      list.appendChild(row);
    });
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return d + '/' + m;
  }

  // ================= PAINEL ADMIN (admin.html) =================
  const adminLoginForm = document.querySelector('#admin-login-form');
  if (adminLoginForm) {
    const ADMIN_PASS = 'bahiense2026';
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.querySelector('#admin-pass').value;
      const errBox = document.querySelector('#admin-login-error');
      if (val === ADMIN_PASS) {
        document.querySelector('#admin-login-wrap').classList.add('hidden');
        document.querySelector('#admin-shell').classList.add('show');
        renderAdmin();
      } else {
        errBox.style.display = 'block';
      }
    });
  }

  const adminLogout = document.querySelector('#admin-logout');
  if (adminLogout) {
    adminLogout.addEventListener('click', () => {
      document.querySelector('#admin-shell').classList.remove('show');
      document.querySelector('#admin-login-wrap').classList.remove('hidden');
      document.querySelector('#admin-pass').value = '';
    });
  }

  const studentForm = document.querySelector('#student-form');
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const students = DB.getStudents();
      students.push({
        id: DB.uid(),
        name: document.querySelector('#s-name').value.trim(),
        cpf: document.querySelector('#s-cpf').value.trim().replace(/\D/g, ''),
        phone: document.querySelector('#s-phone').value.trim(),
        category: document.querySelector('#s-category').value,
        password: document.querySelector('#s-password').value.trim() || '123456'
      });
      DB.saveStudents(students);
      studentForm.reset();
      showToast('Aluno cadastrado com sucesso!');
      renderAdmin();
    });
  }

  const lessonForm = document.querySelector('#lesson-form');
  if (lessonForm) {
    lessonForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const lessons = DB.getLessons();
      lessons.push({
        id: DB.uid(),
        studentId: document.querySelector('#l-student').value,
        type: document.querySelector('#l-type').value,
        date: document.querySelector('#l-date').value,
        time: document.querySelector('#l-time').value,
        instructor: document.querySelector('#l-instructor').value.trim() || '—',
        status: 'agendada'
      });
      DB.saveLessons(lessons);
      lessonForm.reset();
      showToast('Aula agendada com sucesso!');
      renderAdmin();
    });
  }

  window.renderAdmin = function () {
    const students = DB.getStudents();
    const lessons = DB.getLessons();

    // stats
    const statTotal = document.querySelector('#stat-students');
    const statLessons = document.querySelector('#stat-lessons');
    const statDone = document.querySelector('#stat-done');
    if (statTotal) statTotal.textContent = students.length;
    if (statLessons) statLessons.textContent = lessons.length;
    if (statDone) statDone.textContent = lessons.filter(l => l.status === 'concluida').length;

    // tabela alunos
    const sBody = document.querySelector('#students-table-body');
    if (sBody) {
      sBody.innerHTML = '';
      if (!students.length) {
        sBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum aluno cadastrado.</td></tr>';
      }
      students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.name}</td>
          <td>${s.cpf}</td>
          <td>${s.phone}</td>
          <td>Categoria ${s.category}</td>
          <td><button class="icon-btn" data-del-student="${s.id}" title="Remover">✕</button></td>`;
        sBody.appendChild(tr);
      });
    }

    // dropdown de alunos no formulário de aula
    const lStudentSelect = document.querySelector('#l-student');
    if (lStudentSelect) {
      lStudentSelect.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('') || '<option disabled>Cadastre um aluno primeiro</option>';
    }

    // tabela aulas
    const lBody = document.querySelector('#lessons-table-body');
    if (lBody) {
      lBody.innerHTML = '';
      if (!lessons.length) {
        lBody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma aula cadastrada.</td></tr>';
      }
      lessons.slice().reverse().forEach(l => {
        const student = students.find(s => s.id === l.studentId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${student ? student.name : '(aluno removido)'}</td>
          <td>${l.type}</td>
          <td>${formatDate(l.date)} · ${l.time}</td>
          <td>${l.instructor}</td>
          <td>
            <select class="status-select" data-status-lesson="${l.id}">
              <option value="agendada" ${l.status === 'agendada' ? 'selected' : ''}>agendada</option>
              <option value="confirmada" ${l.status === 'confirmada' ? 'selected' : ''}>confirmada</option>
              <option value="concluida" ${l.status === 'concluida' ? 'selected' : ''}>concluída</option>
            </select>
          </td>
          <td><button class="icon-btn" data-del-lesson="${l.id}" title="Remover">✕</button></td>`;
        lBody.appendChild(tr);
      });
    }

    // handlers de remover / alterar status
    document.querySelectorAll('[data-del-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delStudent;
        DB.saveStudents(DB.getStudents().filter(s => s.id !== id));
        DB.saveLessons(DB.getLessons().filter(l => l.studentId !== id));
        showToast('Aluno removido.');
        renderAdmin();
      });
    });
    document.querySelectorAll('[data-del-lesson]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delLesson;
        DB.saveLessons(DB.getLessons().filter(l => l.id !== id));
        showToast('Aula removida.');
        renderAdmin();
      });
    });
    document.querySelectorAll('[data-status-lesson]').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.dataset.statusLesson;
        const lessons = DB.getLessons();
        const l = lessons.find(x => x.id === id);
        if (l) { l.status = sel.value; DB.saveLessons(lessons); showToast('Status atualizado.'); renderAdmin(); }
      });
    });
  };
});
