const ADMIN_EMAIL = 'designmenislamabad@gmail.com';
const configured = window.supabase?.createClient &&
  window.DESIGNMEN_SUPABASE_URL?.startsWith('https://') &&
  window.DESIGNMEN_SUPABASE_ANON_KEY &&
  !window.DESIGNMEN_SUPABASE_ANON_KEY.includes('YOUR_');
const client = configured
  ? window.supabase.createClient(window.DESIGNMEN_SUPABASE_URL, window.DESIGNMEN_SUPABASE_ANON_KEY)
  : null;

const form = document.getElementById('forgotForm');
const message = document.getElementById('forgotMessage');
const submitButton = document.getElementById('sendResetButton');

if (window.matchMedia('(max-width: 760px)').matches) {
  window.location.replace('index.html');
} else {
  document.getElementById('forgotLoading').hidden = true;
  document.getElementById('forgotShell').hidden = false;
  if (!client) {
    message.textContent = 'Supabase config set nahin. Setup guide follow karein.';
    message.classList.add('error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.classList.remove('error');
    const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      message.textContent = 'Sirf designated administrator email use kar sakta hai.';
      message.classList.add('error');
      return;
    }
    if (!client) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    try {
      const redirectTo = new URL('admin-reset-password.html', window.location.href).href;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      message.textContent = 'Agar admin account mojood hai, reset link inbox mein bhej diya gaya hai.';
    } catch (error) {
      message.textContent = 'Reset email nahin bheji ja saki. Supabase email provider aur redirect URL check karein.';
      message.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send reset link';
    }
  });
}