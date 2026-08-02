// Menu mobile
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const shown = links.style.display === 'flex';
      links.style.display = shown ? 'none' : 'flex';
      links.style.cssText += shown ? '' : 'position:absolute;top:70px;left:0;right:0;background:var(--asphalt-900);flex-direction:column;padding:20px 28px;border-bottom:1px solid var(--asphalt-line);gap:16px;align-items:flex-start;';
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // Login form (portal do aluno)
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

      const userVal = userField.querySelector('input').value.trim();
      const passVal = passField.querySelector('input').value.trim();

      if (userVal.length < 3) {
        userField.classList.add('invalid');
        valid = false;
      } else {
        userField.classList.remove('invalid');
      }

      if (passVal.length < 4) {
        passField.classList.add('invalid');
        valid = false;
      } else {
        passField.classList.remove('invalid');
      }

      if (!valid) return;

      // Ambiente de demonstração: revela o painel do aluno com dados de exemplo
      loginWrap.classList.add('hidden');
      portal.classList.add('show');
      if (greet) greet.textContent = 'Bem-vindo(a), ' + userVal.split('@')[0].split('.')[0] + '!';
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
});
