# Setup Guide for SyllabiGuy

This guide will walk you through setting up your API keys and environment variables.

## Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/
   - Sign up or log in to your account

2. **Navigate to API Keys**
   - Click on your profile icon (top right)
   - Select "API keys" from the dropdown
   - Or go directly to: https://platform.openai.com/api-keys

3. **Create a New API Key**
   - Click "Create new secret key"
   - Give it a name (e.g., "SyllabiGuy")
   - Click "Create secret key"
   - **IMPORTANT**: Copy the key immediately - you won't be able to see it again!
   - The key will look like: `sk-...`

4. **Add to .env.local**
   - Open `code/.env.local`
   - Replace `your_openai_api_key_here` with your actual key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```

## Step 2: Get Google OAuth Credentials

### Part A: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: "SyllabiGuy" (or any name you prefer)
   - Click "Create"
   - Wait for the project to be created, then select it

### Part B: Enable Google Calendar API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"
   - Or go to: https://console.cloud.google.com/apis/library

2. **Search for Google Calendar API**
   - In the search bar, type "Google Calendar API"
   - Click on "Google Calendar API" from the results

3. **Enable the API**
   - Click the "Enable" button
   - Wait for it to be enabled (may take a few seconds)

### Part C: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - In the left sidebar, click "APIs & Services" > "Credentials"
   - Or go to: https://console.cloud.google.com/apis/credentials

2. **Configure OAuth Consent Screen** (First time only)
   - Click "OAuth consent screen" tab
   - Select "External" (unless you have a Google Workspace)
   - Click "Create"
   - Fill in the required fields:
     - App name: "SyllabiGuy"
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - On "Scopes" page, click "Save and Continue"
   - On "Test users" page, click "Save and Continue"
   - On "Summary" page, click "Back to Dashboard"

3. **Create OAuth Client ID**
   - Go back to "Credentials" tab
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"

4. **Configure OAuth Client**
   - Application type: Select "Web application"
   - Name: "SyllabiGuy Web Client" (or any name)
   - Authorized redirect URIs: Click "ADD URI" and add:
     ```
     http://localhost:3000/api/calendar/callback
     ```
   - Click "CREATE"

5. **Copy Your Credentials**
   - A popup will appear with your Client ID and Client Secret
   - **IMPORTANT**: Copy both values now!
   - Client ID looks like: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret looks like: `GOCSPX-...`

6. **Add to .env.local**
   - Open `code/.env.local`
   - Replace the Google credentials:
     ```
     GOOGLE_CLIENT_ID=your-actual-client-id-here
     GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
     ```

## Step 3: Verify Your .env.local File

Your `code/.env.local` file should now look like this (with your actual values):

```env
# OpenAI API Key for AI extraction
OPENAI_API_KEY=sk-your-actual-openai-key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# App URL (for production, set to your domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Restart Your Development Server

After updating `.env.local`, you need to restart your dev server:

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   cd code
   pnpm dev
   ```

## Troubleshooting

### OpenAI API Issues
- Make sure your API key starts with `sk-`
- Check that you have credits in your OpenAI account
- Verify the key is active in your OpenAI dashboard

### Google OAuth Issues
- Make sure the redirect URI exactly matches: `http://localhost:3000/api/calendar/callback`
- Verify the Google Calendar API is enabled
- Check that your OAuth consent screen is configured
- If testing, make sure you're using a test user (if app is in testing mode)

### Environment Variables Not Loading
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.example`)
- Make sure the file is in the `code/` directory
- Restart your dev server after making changes
- Check for typos in variable names (they're case-sensitive)

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Never share your API keys publicly
- Keep your credentials secure
- For production, use environment variables provided by your hosting platform (Vercel, Netlify, etc.)

## Next Steps

Once your environment variables are set up:
1. Restart your dev server
2. Try uploading a syllabus file
3. Test the Google Calendar connection
4. Sync events to your calendar

Happy coding! 🎉

