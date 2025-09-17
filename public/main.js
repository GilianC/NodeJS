// Gestion du bouton de déconnexion
document.addEventListener('DOMContentLoaded', () => {
  const logoutForm = document.querySelector('form[action="/logout"]');
  if (logoutForm) {
    logoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fetch('/logout', { method: 'GET', credentials: 'include' })
        .then(() => window.location.href = '/')
        .catch(() => window.location.href = '/');
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pseudo = document.getElementById('pseudo').value;
      const password = document.getElementById('password').value;
      // Envoi du formulaire via fetch
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, password })
      });
      if (res.ok) {
        window.location.href = '/chat?pseudo=' + encodeURIComponent(pseudo);
      } else {
        alert('Connexion échouée');
      }
    });
  }
});
