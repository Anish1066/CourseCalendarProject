import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`
)

// Generate Google OAuth URL
export async function GET(request: NextRequest) {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ]

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    })

    return NextResponse.json({ authUrl: url })
  } catch (error) {
    console.error('Auth URL generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate auth URL',
      },
      { status: 500 }
    )
  }
}

// Handle OAuth callback and exchange code for token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    const { tokens } = await oauth2Client.getToken(code)

    return NextResponse.json({
      success: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to exchange code for token',
      },
      { status: 500 }
    )
  }
}

