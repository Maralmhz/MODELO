// COLE ISSO (substitui tudo):
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  // SUA CONFIG AQUI (pegue no Console → Project Settings → SDK)
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBox = document.getElementById('loginBox');
const appWrap = document.getElementById('appWrap');
const loginMsg = document.getElementById('loginMsg');

// LOGIN SIMPLES (senha fixa "123456")
document.getElementById('btnLogin')?.addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  
  if (senha === '123456') {
    localStorage.setItem('tempUser', email);
    appWrap.style.display = 'block';
    loginBox.style.display = 'none';
  } else {
    loginMsg.textContent = 'Senha: 123456';
    loginMsg.style.color = '#b00020';
  }
});

// ESQUECI SENHA (remove msg erro)
document.getElementById('btnForgotPassword')?.addEventListener('click', () => {
  loginMsg.textContent = 'Senha é 123456 (temporário)';
  loginMsg.style.color = '#1976d2';
});

// LEMBRAR-ME (só visual)
document.getElementById('rememberMe')?.addEventListener('change', (e) => {
  localStorage.setItem('rememberMe', e.target.checked);
});

// MOSTRA UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    appWrap.style.display = 'block';
    loginBox.style.display = 'none';
  }
});
