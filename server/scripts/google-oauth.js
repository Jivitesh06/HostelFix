#!/usr/bin/env node

/**
 * HostelFix — Google OAuth 2.0 Authorization Helper
 *
 * One-time local script to obtain a GOOGLE_REFRESH_TOKEN for Gmail API.
 * This script should NEVER run in production (Render) — only on your local machine.
 *
 * Prerequisites:
 *   1. Create a Google Cloud project with Gmail API enabled
 *   2. Create OAuth 2.0 credentials (Web application type)
 *   3. Add http://localhost:3000/oauth2callback as an authorized redirect URI
 *
 * Usage:
 *   node scripts/google-oauth.js
 *
 * The script will:
 *   1. Read GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from server/.env (or prompt you)
 *   2. Start a temporary local server on port 3000
 *   3. Open your browser to Google's consent screen
 *   4. After you authorize, capture the code and exchange it for tokens
 *   5. Print the GOOGLE_REFRESH_TOKEN for you to copy into .env and Render
 */

const http = require('http');
const { URL } = require('url');
const { google } = require('googleapis');
const readline = require('readline');

// Try to load .env from the server directory
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const PORT = 3000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   HostelFix — Google OAuth 2.0 Authorization Helper     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Get credentials from .env or prompt
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    clientId = await ask('Enter your GOOGLE_CLIENT_ID: ');
    clientId = clientId.trim();
  } else {
    console.log(`✓ GOOGLE_CLIENT_ID loaded from .env`);
  }

  if (!clientSecret) {
    clientSecret = await ask('Enter your GOOGLE_CLIENT_SECRET: ');
    clientSecret = clientSecret.trim();
  } else {
    console.log(`✓ GOOGLE_CLIENT_SECRET loaded from .env`);
  }

  if (!clientId || !clientSecret) {
    console.error('\n✗ Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.');
    console.error('  See docs/GMAIL_API_SETUP.md for instructions.\n');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to always get a refresh token
  });

  console.log('\n─────────────────────────────────────────────────────────');
  console.log('Opening your browser to authorize Gmail API access...\n');
  console.log('If the browser does not open automatically, visit this URL:\n');
  console.log(authUrl);
  console.log('\n─────────────────────────────────────────────────────────\n');

  // Try to open the browser
  const { exec } = require('child_process');
  const openCommand =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';
  exec(`${openCommand} "${authUrl}"`);

  // Start temporary local server to catch the redirect
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);

      if (url.pathname !== '/oauth2callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h2>Authorization Failed</h2><p>Error: ${error}</p><p>You can close this tab.</p></body></html>`);
        console.error(`\n✗ Authorization failed: ${error}\n`);
        rl.close();
        server.close();
        process.exit(1);
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h2>No Code Received</h2><p>You can close this tab.</p></body></html>`);
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; max-width: 520px; margin: 60px auto; text-align: center;">
              <h2 style="color: #16a34a;">✓ Authorization Successful</h2>
              <p>Your refresh token has been printed in the terminal.</p>
              <p style="color: #6b7280;">You can close this tab.</p>
            </body>
          </html>
        `);

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║                ✓ AUTHORIZATION SUCCESSFUL                ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        if (tokens.refresh_token) {
          console.log('Add this to your server/.env file and Render environment:\n');
          console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log('\n⚠  IMPORTANT: Keep this token secret. Never commit it to git.\n');
        } else {
          console.log('⚠  No refresh token received. This can happen if you');
          console.log('   previously authorized this app. Try revoking access at:');
          console.log('   https://myaccount.google.com/permissions');
          console.log('   Then run this script again.\n');
        }
      } catch (tokenErr) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h2>Token Exchange Failed</h2><p>${tokenErr.message}</p></body></html>`);
        console.error(`\n✗ Token exchange failed: ${tokenErr.message}\n`);
      }

      rl.close();
      server.close();
      resolve();
    });

    server.listen(PORT, () => {
      console.log(`Waiting for authorization callback on http://localhost:${PORT}...\n`);
    });
  });
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  rl.close();
  process.exit(1);
});
