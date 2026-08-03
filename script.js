// ===================== DADOS (Supabase, acesso apenas via funções travadas por código) =====================
const DB = {
  async findStudent(cpf, password) {
    const { data, error } = await supabaseClient.rpc('login_student', { p_cpf: cpf, p_password: password });
    if (error) { console.error(error); return null; }
    return (data && data.length) ? data[0] : null;
  },
  async getStudentLessons(studentId) {
    const { data, error } = await supabaseClient.rpc('get_student_lessons', { p_student_id: studentId });
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async adminGetStudents() {
    const { data, error } = await supabaseClient.rpc('admin_get_students', { p_code: ADMIN_CODE });
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async adminGetLessons() {
    const { data, error } = await supabaseClient.rpc('admin_get_lessons', { p_code: ADMIN_CODE });
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async addStudent(s) {
    const { error } = await supabaseClient.rpc('admin_add_student', {
      p_code: ADMIN_CODE, p_name: s.name, p_cpf: s.cpf, p_phone: s.phone, p_category: s.category, p_password: s.password
    });
    if (error) { console.error(error); showToast('Erro ao cadastrar aluno.'); return false; }
    return true;
  },
  async deleteStudent(id) {
    const { error } = await supabaseClient.rpc('admin_delete_student', { p_code: ADMIN_CODE, p_id: id });
    if (error) { console.error(error); showToast('Erro ao remover aluno.'); return false; }
    return true;
  },
  async addLesson(l) {
    const { error } = await supabaseClient.rpc('admin_add_lesson', {
      p_code: ADMIN_CODE, p_student_id: l.student_id, p_type: l.type, p_date: l.date, p_time: l.time, p_instructor: l.instructor
    });
    if (error) { console.error(error); showToast('Erro ao agendar aula.'); return false; }
    return true;
  },
  async deleteLesson(id) {
    const { error } = await supabaseClient.rpc('admin_delete_lesson', { p_code: ADMIN_CODE, p_id: id });
    if (error) { console.error(error); showToast('Erro ao remover aula.'); return false; }
    return true;
  },
  async updateLessonStatus(id, status) {
    const { error } = await supabaseClient.rpc('admin_update_lesson_status', { p_code: ADMIN_CODE, p_id: id, p_status: status });
    if (error) { console.error(error); showToast('Erro ao atualizar status.'); return false; }
    return true;
  }
};

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return d + '/' + m;
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
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

  // ---------- Tabs (admin) ----------
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

  // ================= LOGIN DO ALUNO =================
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    const userField = document.querySelector('#field-user');
    const passField = document.querySelector('#field-pass');
    const loginWrap = document.querySelector('#login-wrap');
    const portal = document.querySelector('#portal');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      const cpfVal = userField.querySelector('input').value.trim().replace(/\D/g, '');
      const passVal = passField.querySelector('input').value.trim();

      if (cpfVal.length < 3) { userField.classList.add('invalid'); valid = false; } else userField.classList.remove('invalid');
      if (passVal.length < 3) { passField.classList.add('invalid'); valid = false; } else passField.classList.remove('invalid');
      if (!valid) return;

      submitBtn.textContent = 'Entrando...';
      let student = null;
      try {
        student = await DB.findStudent(cpfVal, passVal);
      } catch (err) {
        console.error(err);
        submitBtn.textContent = 'Entrar';
        passField.classList.add('invalid');
        passField.querySelector('.field-error').textContent = 'Erro de conexão com o servidor. Tente novamente em instantes.';
        return;
      }
      submitBtn.textContent = 'Entrar';

      if (!student) {
        passField.classList.add('invalid');
        passField.querySelector('.field-error').textContent = 'CPF ou senha incorretos. (Aluno demo: CPF 12345678900, senha demo123)';
        return;
      }

      await renderPortal(student);
      loginWrap.classList.add('hidden');
      portal.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const logoutBtn = document.querySelector('#logout-btn');
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

  async function renderPortal(student) {
    const lessons = await DB.getStudentLessons(student.id);
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
    if (!lessons.length) { list.innerHTML = '<div class="empty-state">Nenhuma aula cadastrada ainda.</div>'; return; }
    lessons.forEach(l => {
      const row = document.createElement('div');
      row.className = 'lesson-row';
      const badgeClass = l.status === 'concluida' || l.status === 'confirmada' ? 'ok' : '';
      row.innerHTML = `
        <span class="lesson-time">${formatDate(l.date)}</span>
        <span class="avatar">${(l.instructor || '—').slice(0,2).toUpperCase()}</span>
        <div class="lesson-info"><div class="name">${l.type}</div><div class="meta">${l.time} · Instrutor: ${l.instructor || '—'}</div></div>
        <span class="badge ${badgeClass}">${l.status}</span>`;
      list.appendChild(row);
    });
  }

  // ================= PAINEL ADMIN =================
  const adminLoginForm = document.querySelector('#admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.querySelector('#admin-pass').value;
      const errBox = document.querySelector('#admin-login-error');
      if (val === ADMIN_CODE) {
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
    studentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await DB.addStudent({
        name: document.querySelector('#s-name').value.trim(),
        cpf: document.querySelector('#s-cpf').value.trim().replace(/\D/g, ''),
        phone: document.querySelector('#s-phone').value.trim(),
        category: document.querySelector('#s-category').value,
        password: document.querySelector('#s-password').value.trim() || '123456'
      });
      if (ok) { studentForm.reset(); showToast('Aluno cadastrado com sucesso!'); renderAdmin(); }
    });
  }

  const lessonForm = document.querySelector('#lesson-form');
  if (lessonForm) {
    lessonForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await DB.addLesson({
        student_id: document.querySelector('#l-student').value,
        type: document.querySelector('#l-type').value,
        date: document.querySelector('#l-date').value,
        time: document.querySelector('#l-time').value,
        instructor: document.querySelector('#l-instructor').value.trim() || '—'
      });
      if (ok) { lessonForm.reset(); showToast('Aula agendada com sucesso!'); renderAdmin(); }
    });
  }

  window.renderAdmin = async function () {
    const students = await DB.adminGetStudents();
    const lessons = await DB.adminGetLessons();

    const statTotal = document.querySelector('#stat-students');
    const statLessons = document.querySelector('#stat-lessons');
    const statDone = document.querySelector('#stat-done');
    if (statTotal) statTotal.textContent = students.length;
    if (statLessons) statLessons.textContent = lessons.length;
    if (statDone) statDone.textContent = lessons.filter(l => l.status === 'concluida').length;

    const sBody = document.querySelector('#students-table-body');
    if (sBody) {
      sBody.innerHTML = '';
      if (!students.length) sBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum aluno cadastrado.</td></tr>';
      students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.name}</td><td>${s.cpf}</td><td>${s.phone}</td><td>Categoria ${s.category}</td>
          <td><button class="icon-btn" data-del-student="${s.id}" title="Remover">✕</button></td>`;
        sBody.appendChild(tr);
      });
    }

    const lStudentSelect = document.querySelector('#l-student');
    if (lStudentSelect) {
      lStudentSelect.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('') || '<option disabled>Cadastre um aluno primeiro</option>';
    }

    const lBody = document.querySelector('#lessons-table-body');
    if (lBody) {
      lBody.innerHTML = '';
      if (!lessons.length) lBody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma aula cadastrada.</td></tr>';
      lessons.slice().reverse().forEach(l => {
        const student = students.find(s => s.id === l.student_id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${student ? student.name : '(aluno removido)'}</td>
          <td>${l.type}</td>
          <td>${formatDate(l.date)} · ${l.time}</td>
          <td>${l.instructor || '—'}</td>
          <td><select class="status-select" data-status-lesson="${l.id}">
            <option value="agendada" ${l.status === 'agendada' ? 'selected' : ''}>agendada</option>
            <option value="confirmada" ${l.status === 'confirmada' ? 'selected' : ''}>confirmada</option>
            <option value="concluida" ${l.status === 'concluida' ? 'selected' : ''}>concluída</option>
          </select></td>
          <td><button class="icon-btn" data-del-lesson="${l.id}" title="Remover">✕</button></td>`;
        lBody.appendChild(tr);
      });
    }

    document.querySelectorAll('[data-del-student]').forEach(btn => {
      btn.addEventListener('click', async () => { if (await DB.deleteStudent(btn.dataset.delStudent)) { showToast('Aluno removido.'); renderAdmin(); } });
    });
    document.querySelectorAll('[data-del-lesson]').forEach(btn => {
      btn.addEventListener('click', async () => { if (await DB.deleteLesson(btn.dataset.delLesson)) { showToast('Aula removida.'); renderAdmin(); } });
    });
    document.querySelectorAll('[data-status-lesson]').forEach(sel => {
      sel.addEventListener('change', async () => { if (await DB.updateLessonStatus(sel.dataset.statusLesson, sel.value)) { showToast('Status atualizado.'); renderAdmin(); } });
    });
  };
});
