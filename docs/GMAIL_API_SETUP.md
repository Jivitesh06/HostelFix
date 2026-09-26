# HostelFix — Gmail API Setup Guide

This guide walks you through setting up Gmail API for sending OTP verification emails from HostelFix.

## Prerequisites

- A Google account (your personal Gmail works fine)
- Node.js installed locally
- Access to your HostelFix server `.env` file

---

## Step A: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it `HostelFix` (or any name you prefer)
4. Click **Create**
5. Make sure the new project is selected in the top-left dropdown

## Step B: Enable Gmail API

1. Go to [Gmail API page](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. Make sure your project is selected
3. Click **Enable**

## Step C: Configure OAuth Consent Screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select **External** → Click **Create**
3. Fill in:
   - **App name**: `HostelFix`
   - **User support email**: Your Gmail address
   - **Developer contact**: Your Gmail address
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**
6. Find and select: `https://www.googleapis.com/auth/gmail.send`
7. Click **Update** → **Save and Continue**
8. On the **Test users** page, click **Add Users**
9. Add your Gmail address (the one you'll send emails from)
10. Click **Save and Continue** → **Back to Dashboard**

> **Note**: While the app is in "Testing" status, only test users can authorize it. This is fine for HostelFix since only your account sends emails.

## Step D: Create OAuth 2.0 Credentials

1. Go to [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `HostelFix Email Service`
5. Under **Authorized redirect URIs**, click **Add URI**
6. Enter: `http://localhost:3000/oauth2callback`
7. Click **Create**
8. **Copy** the **Client ID** and **Client secret** — you'll need these next

## Step E: Add Client Credentials to .env

Open `server/.env` and add:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step F: Run the Authorization Script

From the `server/` directory:

```bash
node scripts/google-oauth.js
```

The script will:
1. Read your Client ID and Secret from `.env`
2. Open your browser to Google's consent screen
3. Ask you to authorize Gmail API access for your account
4. Print a `GOOGLE_REFRESH_TOKEN` in the terminal

## Step G: Save the Refresh Token

1. Copy the `GOOGLE_REFRESH_TOKEN` from the terminal
2. Add it to `server/.env`:

```
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

3. Set your sender email:

```
EMAIL_FROM=your-gmail@gmail.com
```

## Step H: Add Credentials to Render (Production)

In your [Render dashboard](https://dashboard.render.com/), go to your HostelFix service:

1. Click **Environment** → **Add Environment Variable**
2. Add these four variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your OAuth Client Secret |
| `GOOGLE_REFRESH_TOKEN` | The token from Step G |
| `EMAIL_FROM` | Your Gmail address |

3. Click **Save Changes** — Render will auto-redeploy

## Step I: Verify It Works

1. Register a test student with a real `@chitkarauniversity.edu.in` email
2. Check the inbox for the OTP verification email
3. The email should arrive from your Gmail address with HostelFix branding

---

## Troubleshooting

### "No refresh token received"

If the authorization script doesn't return a refresh token:
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Remove `HostelFix` from the list
3. Run `node scripts/google-oauth.js` again

### "Token has been expired or revoked"

Your refresh token may have expired if:
- You revoked access in Google Account settings
- The Google Cloud project was idle for 6+ months
- You changed your Google password

**Fix**: Run `node scripts/google-oauth.js` again to get a new token.

### "Mail delivery failed" in server logs

Check:
1. `EMAIL_FROM` matches the Gmail account you authorized
2. All four environment variables are set correctly
3. Gmail API is still enabled in Google Cloud Console

### Daily sending limits

Gmail API has a daily sending limit of ~500 emails/day for consumer accounts. This is sufficient for student registration OTPs. If you need higher volume, consider upgrading to Google Workspace.

---

## Security Notes

- **Never commit** `.env`, refresh tokens, or client secrets to Git
- The refresh token grants access to send email from your Gmail — treat it like a password
- The OAuth helper script (`scripts/google-oauth.js`) only runs locally, never in production
- Access tokens are automatically refreshed by the `googleapis` library — no manual rotation needed
