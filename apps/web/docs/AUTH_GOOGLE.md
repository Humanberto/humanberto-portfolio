# Google OAuth setup (Humanberto / Supabase)

If SSO lands on a blank page or shows **Unable to exchange external code**, Supabase could not trade Google's code for tokens. Fix the **Google Cloud** and **Supabase** config below — not the Next.js callback URL.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Create or edit an **OAuth 2.0 Client ID** of type **Web application**.
3. Under **Authorized redirect URIs**, add exactly:

   ```text
   https://cdkmmduedxmpwxwbvwrd.supabase.co/auth/v1/callback
   ```

   Do **not** put `localhost` or `humanberto.com/auth/callback` here — only the Supabase callback above.

4. Copy the **Client ID** and **Client secret** (no leading/trailing spaces).

5. If the OAuth consent screen is in **Testing**, add your Google account under **Test users**.

## 2. Supabase Dashboard

1. [Authentication → Providers → Google](https://supabase.com/dashboard/project/cdkmmduedxmpwxwbvwrd/auth/providers)
2. Enable Google and paste Client ID + Client Secret.
3. Save.

## 3. Supabase URL configuration

[Authentication → URL Configuration](https://supabase.com/dashboard/project/cdkmmduedxmpwxwbvwrd/auth/url-configuration)

**Critical:** **Site URL must be production**, not localhost. Supabase sends OAuth failures (and some successes) to Site URL — if it is `http://localhost:3006`, production users land on a blank local page.

| Setting | Value |
|---------|--------|
| **Site URL** | `https://www.humanberto.com` |
| **Redirect URLs** | `https://www.humanberto.com/auth/callback`, `https://humanberto.com/auth/callback`, plus local dev ports below |

Add every port you use locally (3000, 3001, 3006, etc.) under **Redirect URLs** only — never as Site URL:

```text
http://localhost:3006/auth/callback
```

Do **not** run `npm run setup:auth` with `NEXT_PUBLIC_SITE_URL=http://localhost:…` unless you also set `SUPABASE_SITE_URL=https://www.humanberto.com`.

## 4. Local `.env.local`

Match the port you run dev on:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3006
NEXT_PUBLIC_SUPABASE_URL=https://cdkmmduedxmpwxwbvwrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase → Settings → API>
```

Run dev on the same port:

```bash
cd apps/web
npm run dev -- -p 3006
```

## 5. Verify

1. Open `http://localhost:3006/signup`
2. **Continue with Google**
3. You should return to `/auth/callback` then `/onboarding` or `/s/your-slug`

If it still fails, check **Dashboard → Logs → Auth** for the underlying Google API error.

## Diagnose from CLI

```bash
cd apps/web
npm run diagnose:google-auth
```

As of the last check, Supabase uses Google client ID  
`902963027413-7tlrpkpf5rqjq4tr469uaocot2es7ic4.apps.googleusercontent.com`  
and Google **accepts** the Supabase callback redirect URI. If you still see **Unable to exchange external code**, the **Client Secret in Supabase is wrong** for that OAuth client — regenerate or re-copy it in Google Cloud, then re-paste in Supabase → Authentication → Google.

## CLI helper

From repo root (requires `SUPABASE_ACCESS_TOKEN`):

```bash
cd apps/web
npm run setup:auth
```

Pass Google credentials via env when running:

```powershell
$env:GOOGLE_OAUTH_CLIENT_ID = "..."
$env:GOOGLE_OAUTH_CLIENT_SECRET = "..."
npm run setup:auth
```
