# SyllabiGuy

Turn your class syllabi into a smart calendar. Upload your syllabi and automatically extract important dates (exams, homework, projects) and sync them to your Google Calendar.

## Features

- 📄 **Upload Syllabi**: Support for PDF, DOC, DOCX, and TXT files
- 🤖 **AI Extraction**: Automatically extract events using OpenAI
- 📅 **Google Calendar Sync**: One-click sync to your Google Calendar
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini
- **File Processing**: pdf-parse, mammoth
- **Calendar**: Google Calendar API

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the `code` directory with the following variables:

```env
# OpenAI API Key for AI extraction
OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# App URL (for production, set to your domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/calendar/callback` (for development)
     - Your production URL (for production)
   - Copy the Client ID and Client Secret to your `.env.local` file

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### POST `/api/upload`
Upload and process a syllabus file.

**Request**: FormData with `file` field
**Response**: 
```json
{
  "success": true,
  "course": "CS 2120 - Discrete Math",
  "events": [...],
  "filename": "syllabus.pdf"
}
```

### GET `/api/calendar/auth`
Get Google OAuth URL.

**Response**:
```json
{
  "authUrl": "https://accounts.google.com/..."
}
```

### POST `/api/calendar/auth`
Exchange OAuth code for access token.

**Request**:
```json
{
  "code": "authorization_code"
}
```

**Response**:
```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "...",
  "expiryDate": 1234567890
}
```

### POST `/api/calendar/sync`
Sync events to Google Calendar.

**Request**:
```json
{
  "accessToken": "...",
  "events": [
    {
      "title": "Midterm Exam",
      "date": "2024-10-15",
      "time": "2:00 PM",
      "type": "Exam"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "created": 5,
  "failed": 0,
  "results": [...]
}
```

## Project Structure

```
.
├── app/                   # Next.js app directory
│   ├── api/              # API routes
│   │   ├── upload/       # File upload endpoint
│   │   ├── calendar/     # Google Calendar endpoints
│   │   └── health/       # Health check endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/              # React components
│   ├── ui/               # Reusable UI components
│   ├── events-preview-section.tsx
│   ├── google-calendar-section.tsx
│   ├── hero-section.tsx
│   └── ...
├── contexts/            # React Context providers
│   └── events-context.tsx
├── hooks/                # Custom React hooks
│   ├── use-events.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/                  # Utility libraries
│   ├── ai/               # AI-related utilities
│   │   ├── extractor.ts  # Event extraction from files
│   │   └── file-processor.ts
│   └── utils.ts          # General utilities
├── public/               # Static assets
├── docs/                 # Documentation
│   ├── SETUP_GUIDE.md
│   └── VERIFICATION_CHECKLIST.md
├── package.json
├── tsconfig.json
└── README.md
```

## Development

- The app uses Next.js App Router
- API routes are in `app/api/`
- Components are in `components/`
- Shared state is managed via React hooks

## Production Deployment

1. Set environment variables in your hosting platform
2. Update `GOOGLE_REDIRECT_URI` to your production URL
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Build and deploy:

```bash
pnpm build
pnpm start
```

## License

See LICENSE file for details.

