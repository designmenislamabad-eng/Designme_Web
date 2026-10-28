const adminEmail = 'designmenislamabad@gmail.com';
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loginButton = document.getElementById('loginButton');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const signupToggle = document.getElementById('signupToggle');
const otpForm = document.getElementById('otpForm');
const otpCode = document.getElementById('otpCode');
const verifyOtpButton = document.getElementById('verifyOtpButton');
const resendOtpButton = document.getElementById('resendOtpButton');
const changeAccountButton = document.getElementById('changeAccountButton');
let signupMode = false;

if (window.matchMedia('(max-width: 760px)').matches) {
  window.location.replace('index.html');
} else {
  document.getElementById('loginLoading').hidden = true;
  document.getElementById('loginShell').hidden = false;

  const isConfigured = window.supabase?.createClient &&
    window.DESIGNMEN_SUPABASE_URL?.startsWith('https://') &&
    window.DESIGNMEN_SUPABASE_ANON_KEY &&
    !window.DESIGNMEN_SUPABASE_ANON_KEY.includes('YOUR_');
  const client = isConfigured
    ? window.supabase.createClient(window.DESIGNMEN_SUPABASE_URL, window.DESIGNMEN_SUPABASE_ANON_KEY)
    : null;

  if (!client) {
    loginMessage.textContent = 'Pehle supabase-config.js mein project URL aur anon key set karein.';
    loginMessage.classList.add('error');
  } else {
    client.auth.getSession().then(async ({ data }) => {
      if (data.session?.user?.email?.toLowerCase() !== adminEmail) return;
      const { data: mfa } = await client.functions.invoke('admin-email-mfa', { body: { action: 'status' } });
      if (mfa?.verified) window.location.replace('admin-dashboard.html');
      else await client.auth.signOut();
    });
  }

  async function requestCode() {
    const { error } = await client.functions.invoke('admin-email-mfa', { body: { action: 'request' } });
    if (error) throw error;
  }

  function showOtpStep() {
    document.getElementById('loginForm').hidden = true;
    otpForm.hidden = false;
    forgotPasswordLink.hidden = true;
    signupToggle.hidden = true;
    document.getElementById('loginTitle').textContent = 'Verify your email';
    document.getElementById('loginIntro').textContent = `6-digit code ${adminEmail} par bheja gaya hai.`;
    loginMessage.textContent = '';
    otpCode.focus();
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    loginMessage.textContent = '';
    loginMessage.classList.remove('error');

    if (email !== adminEmail) {
      loginMessage.textContent = 'Sirf designated administrator account sign in kar sakta hai.';
      loginMessage.classList.add('error');
      return;
    }
    if (!client) return;

    loginButton.disabled = true;
    loginButton.textContent = signupMode ? 'Creating account...' : 'Signing in...';

    if (signupMode) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: new URL('admin-login.html', window.location.href).href }
      });
      if (data.session) await client.auth.signOut();
      loginButton.disabled = false;
      loginButton.textContent = 'Create admin account';
      loginMessage.textContent = error
        ? 'Account create nahin hua. Signup setting check karein ya account pehle se bana hua hai.'
        : 'Confirmation email check karein. Email confirm hone ke baad isi page par sign in karein.';
      loginMessage.classList.toggle('error', Boolean(error));
      return;
    }

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      loginButton.disabled = false;
      loginButton.textContent = 'Sign in';
      loginMessage.textContent = 'Sign in nahin ho saka. Email/password check karein.';
      loginMessage.classList.add('error');
      return;
    }
    try {
      await requestCode();
      showOtpStep();
    } catch (requestError) {
      await client.auth.signOut();
      loginMessage.textContent = 'Email code nahin bheja ja saka. Edge Function, email provider, aur secrets check karein.';
      loginMessage.classList.add('error');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Sign in';
    }
  });

  signupToggle.addEventListener('click', () => {
    signupMode = !signupMode;
    loginButton.textContent = signupMode ? 'Create admin account' : 'Sign in';
    document.getElementById('password').autocomplete = signupMode ? 'new-password' : 'current-password';
    forgotPasswordLink.hidden = signupMode;
    signupToggle.textContent = signupMode ? 'Already registered? Sign in' : 'First time? Create admin account';
    loginMessage.textContent = signupMode
      ? 'Signup sirf designated admin email ke liye hai. Email confirmation zaroori hai.'
      : '';
    loginMessage.classList.remove('error');
  });

  otpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = 'Checking code...';
    loginMessage.textContent = '';
    loginMessage.classList.remove('error');
    try {
      const { data, error } = await client.functions.invoke('admin-email-mfa', {
        body: { action: 'verify', code: otpCode.value.trim() }
      });
      if (error || !data?.verified) throw error || new Error('Verification failed.');
      window.location.replace('admin-dashboard.html');
    } catch (error) {
      loginMessage.textContent = 'Code ghalat ya expire ho gaya. Naya code mangwayein ya dobara try karein.';
      loginMessage.classList.add('error');
    } finally {
      verifyOtpButton.disabled = false;
      verifyOtpButton.textContent = 'Verify code';
    }
  });

  resendOtpButton.addEventListener('click', async () => {
    resendOtpButton.disabled = true;
    loginMessage.classList.remove('error');
    try {
      await requestCode();
      loginMessage.textContent = 'Naya code email kar diya hai.';
    } catch (error) {
      loginMessage.textContent = 'Naya code nahin bheja ja saka. Ek minute baad try karein.';
      loginMessage.classList.add('error');
    } finally {
      window.setTimeout(() => { resendOtpButton.disabled = false; }, 60_000);
    }
  });

  changeAccountButton.addEventListener('click', async () => {
    await client.auth.signOut();
    otpForm.hidden = true;
    loginForm.hidden = false;
    forgotPasswordLink.hidden = false;
    signupToggle.hidden = false;
    signupMode = false;
    loginButton.textContent = 'Sign in';
    signupToggle.textContent = 'First time? Create admin account';
    document.getElementById('loginTitle').textContent = 'Sign in';
    document.getElementById('loginIntro').textContent = 'Website content workspace';
    document.getElementById('password').value = '';
    otpCode.value = '';
    loginMessage.textContent = '';
  });

}