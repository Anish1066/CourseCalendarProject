# Verification Checklist

Use this checklist to verify everything is set up correctly before testing.

## ✅ Environment Variables

- [ ] `.env.local` file exists in the `code/` directory
- [ ] `OPENAI_API_KEY` is set (starts with `sk-`)
- [ ] `GOOGLE_CLIENT_ID` is set (ends with `.apps.googleusercontent.com`)
- [ ] `GOOGLE_CLIENT_SECRET` is set (starts with `GOCSPX-`)
- [ ] `GOOGLE_REDIRECT_URI` is set to `http://localhost:3000/api/calendar/callback`
- [ ] `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`

## ✅ API Keys & Credentials

- [ ] OpenAI API key is valid and has credits
- [ ] Google OAuth credentials are created in Google Cloud Console
- [ ] Google Calendar API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] Redirect URI matches exactly: `http://localhost:3000/api/calendar/callback`

## ✅ Server Status

- [ ] Development server is running (`pnpm dev`)
- [ ] Server is accessible at http://localhost:3000
- [ ] No errors in the terminal/console

## ✅ Testing the App

### Test File Upload:
1. [ ] Go to http://localhost:3000
2. [ ] Click "Upload Syllabus" or drag & drop a PDF/DOC file
3. [ ] File uploads successfully
4. [ ] Events are extracted and displayed
5. [ ] Events appear in the "My Classes" section

### Test Google Calendar Connection:
1. [ ] Click "Connect with Google" button
2. [ ] OAuth popup opens
3. [ ] Sign in with Google account
4. [ ] Grant calendar permissions
5. [ ] Popup closes automatically
6. [ ] "Connected" message appears
7. [ ] "Sync Events to Calendar" button is available

### Test Event Syncing:
1. [ ] Select events in "My Classes" section
2. [ ] Click "Review & Add to Google Calendar" (scrolls to calendar section)
3. [ ] Click "Sync Events to Calendar"
4. [ ] Events appear in your Google Calendar
5. [ ] Success message shows number of events created

## 🐛 Troubleshooting

### If file upload fails:
- Check that `OPENAI_API_KEY` is correct
- Verify OpenAI account has credits
- Check browser console for errors
- Verify file is PDF, DOC, DOCX, or TXT format

### If Google OAuth fails:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly in Google Cloud Console
- Ensure Google Calendar API is enabled
- Check browser console for errors
- Try clearing browser cache

### If events don't sync:
- Verify Google Calendar connection is successful
- Check that events are selected in the preview section
- Verify access token is valid
- Check browser console and server logs for errors

## 📝 Notes

- The app processes files on the server (not stored permanently)
- Events are extracted using AI (OpenAI GPT-4o-mini)
- Google Calendar sync requires OAuth authentication
- All API calls are made from the browser to Next.js API routes

## 🎉 Success Criteria

Everything is working if:
- ✅ You can upload a syllabus file
- ✅ Events are extracted and displayed
- ✅ You can connect to Google Calendar
- ✅ Selected events sync to your Google Calendar

If all items are checked, you're ready to go! 🚀

