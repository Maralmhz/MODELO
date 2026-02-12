import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // ajuste conforme seu arquivo
// ...

const auth = getAuth();

document.getElementById("btnForgotPassword")?.addEventListener("click", async () => {
  const email = (document.getElementById("loginEmail")?.value || "").trim();
  const msgEl = document.getElementById("loginMsg");

  if (!email) {
    if (msgEl) msgEl.textContent = "Digite seu email para receber o link de redefinição.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email); // [web:5][web:1]
    if (msgEl) {
      msgEl.style.color = "#2e7d32";
      msgEl.textContent = "Enviamos um link de redefinição de senha para o seu email.";
    }
  } catch (err) {
    if (msgEl) {
      msgEl.style.color = "#b00020";
      msgEl.textContent = "Não foi possível enviar o email. Verifique o endereço e tente novamente.";
    }
  }
});
