const ADMIN_EMAIL = 'designmenislamabad@gmail.com';
const isConfigured = window.supabase?.createClient &&
  window.DESIGNMEN_SUPABASE_URL?.startsWith('https://') &&
  window.DESIGNMEN_SUPABASE_ANON_KEY &&
  !window.DESIGNMEN_SUPABASE_ANON_KEY.includes('YOUR_');
const client = isConfigured
  ? window.supabase.createClient(window.DESIGNMEN_SUPABASE_URL, window.DESIGNMEN_SUPABASE_ANON_KEY)
  : null;

const loading = document.getElementById('resetLoading');
const form = document.getElementById('resetForm');
const message = document.getElementById('resetMessage');
const updateButton = document.getElementById('resetButton');

if (window.matchMedia('(max-width: 760px)').matches) {
  window.location.replace('index.html');
} else if (!client) {
  loading.textContent = 'Supabase config set nahin. Setup guide follow karein.';
} else {
  client.auth.getSession().then(({ data, error }) => {
    const email = data.session?.user?.email?.toLowerCase();
    if (error || email !== ADMIN_EMAIL) {
      loading.textContent = 'Reset link invalid ya expire ho chuka hai. Login page se naya link mangwayein.';
      return;
    }
    document.getElementById('resetEmail').textContent = email;
    document.getElementById('resetShell').hidden = false;
    loading.hidden = true;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.classList.remove('error');
    const password = document.getElementById('newPassword').value;
    if (password !== document.getElementById('confirmPassword').value) {
      message.textContent = 'Dono passwords match nahin karte.';
      message.classList.add('error');
      return;
    }
    updateButton.disabled = true;
    const { error } = await client.auth.updateUser({ password });
    updateButton.disabled = false;
    if (error) {
      message.textContent = 'Password update nahin hua. Reset link expire ho sakta hai.';
      message.classList.add('error');
      return;
    }
    message.textContent = 'Password update ho gaya. Ab admin dashboard khol rahe hain...';
    window.setTimeout(() => window.location.replace('admin-dashboard.html'), 1200);
  });
}