# Supabase setup

## Browser keys

Only these two values are needed in `supabase-config.js`:

- Project URL: `https://bmeriawhcudmgzjunlpy.supabase.co` (already set in `supabase-config.js`).
- Publishable key (or legacy `anon` key): already set in `supabase-config.js`. It is safe to use in browser code because database access is restricted by Row Level Security.

Do not use the `service_role` / secret key, database password, JWT secret, or SMTP password in frontend files. Storage uses the same Project URL and publishable/anon key; no extra Storage key is needed.

## Supabase setup

1. In Supabase SQL Editor, run `supabase-setup.sql`. It creates the homepage content table, private OTP/MFA tables, the MFA verification function, public image/PDF bucket, and RLS policies. Rerun it after updates.
2. In Authentication > Providers, enable Email and email confirmation. For the first admin registration, temporarily allow new users, open `admin-login.html`, use **First time? Create admin account** with `designmenislamabad@gmail.com`, and confirm the email. Then turn off public sign-ups again. You can instead create the one account yourself in Authentication > Users. Do not create employee accounts.
3. In Authentication > URL Configuration, set the Site URL to your website origin. Add both `admin-login.html` and `admin-reset-password.html` as Redirect URLs, for local testing and for the exact deployed website origin. Example local URLs: `http://127.0.0.1:5500/admin-login.html` and `http://127.0.0.1:5500/admin-reset-password.html`.
4. Put the Project URL and publishable/anon key in `supabase-config.js`. Serve the site over localhost or HTTPS, then open `admin-login.html` on desktop.

Supabase Auth already owns the `auth.users` table and securely stores password hashes and recovery tokens. Do not create a separate password or forgot-password table and do not insert users through SQL. To check the admin after creating the account in Authentication > Users, run `select id, email, email_confirmed_at from auth.users where lower(email) = 'designmenislamabad@gmail.com';` in SQL Editor. The login page links to `admin-forgot-password.html`, which sends the reset email; its link opens `admin-reset-password.html`, where Supabase Auth updates the password. Password reset email delivery requires the Supabase Email provider; configure custom SMTP for production delivery.

The login UI only accepts the designated admin email; the dashboard and Row Level Security independently enforce it and require a verified email-code session for content changes and Storage upload/update/delete. Other Auth accounts cannot enter the dashboard. The public website can view files and the dashboard can list them; only the designated admin can upload, update, or delete. Anyone can view files in the public bucket if they have the URL. Password changes are available under Settings after sign-in. Login, forgot-password, and reset routes are unavailable on viewports up to 760px.

Existing homepage items are used as fallback defaults until the administrator saves the first set of content to Supabase. The dashboard Media Library accepts JPEG, PNG, WebP, AVIF images, and PDFs up to 25 MB. Image uploads are saved in Storage and can be reused in homepage/page editors; uploaded PDFs are added to the website footer Downloads automatically.

## Password plus email code (MFA)

The login flow checks the password first, then emails a six-digit code to the designated admin. The code expires after five minutes, permits at most five guesses, and requests are limited to one per minute. A successful verification creates an eight-hour MFA session; database and Storage write policies reject password-only sessions.

### Windows par setup

1. Resend.com par account banayein, apna email sending domain verify karein, aur **API Keys** se API key banayein. `OTP_FROM_EMAIL` mein isi verified domain ka sender use hoga.
2. PowerShell khol kar Supabase CLI install karein. Scoop install ke baad CLI commands usi PowerShell mein chalayein:

	```powershell
	Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
	Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
	scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
	scoop install supabase
	supabase --version
	```

3. Isi workspace folder mein PowerShell kholo: `Desktop\DESIGNMEN Web-Project`. CLI mein sign in aur Supabase project link karein:

	```powershell
	supabase login
	supabase link --project-ref bmeriawhcudmgzjunlpy
	```

	`supabase login` ke prompts follow karein. Agar project database password maange to use sirf PowerShell prompt mein enter karein; yahan chat ya website code mein share na karein.
4. Supabase Dashboard mein **Edge Functions > Secrets** kholein aur yeh teen secrets add karein:
	- `RESEND_API_KEY`: Resend API Keys se banayi hui key.
	- `OTP_FROM_EMAIL`: verified sender, misal `Designmen Admin <admin@your-verified-domain.com>`.
	- `OTP_HASH_SECRET`: random, lamba secret. Ise sirf Supabase Secrets mein rakhein.

	`SUPABASE_URL`, `SUPABASE_ANON_KEY`, aur `SUPABASE_SERVICE_ROLE_KEY` deployed Edge Function ko Supabase khud deta hai. `service_role` key ko browser config, GitHub, ya chat mein kabhi na daalein.
5. PowerShell mein project root se function deploy karein:

	```powershell
	supabase functions deploy admin-email-mfa
	```

6. Supabase **SQL Editor** mein `supabase-setup.sql` ki updated poori file run karein. Is se OTP tables/functions aur RLS policies deploy hongi.
7. Supabase **Authentication > URL Configuration** ke **Redirect URLs** mein apni live site ka reset page add karein:
	`https://designmenislamabad-eng.github.io/DESIGNMEN_Web_Dashboard/admin-reset-password.html`

	Local test ke liye `http://127.0.0.1:5500/admin-reset-password.html` bhi add karein.
8. Pehli admin registration ke waqt **Authentication > Providers > Email** mein email signups aur confirmation enable karein. Login page ke **First time? Create admin account** se `designmenislamabad@gmail.com` account banayein aur inbox se confirm karein. Phir public signups ko disable kar dein. Signup disabled rakhna ho to admin account ko seedha **Authentication > Users** se create karein.
9. `admin-login.html` par admin email/password enter karein. Email par 6-digit code aana chahiye; sahi code dene ke baad dashboard khulega. Forgot-password email bhi chalane ke liye Supabase Auth email provider/SMTP configure karein.

The browser only uses the public anon key. The Edge Function uses the service-role key privately to write challenge/session records; its table has no browser access. Never expose the service-role key.