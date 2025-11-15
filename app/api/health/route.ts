import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const checks = {
    openaiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
    googleClientId: !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here',
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here',
  }

  return NextResponse.json({
    status: 'ok',
    checks,
    message: checks.openaiKey 
      ? 'Environment variables are configured' 
      : '⚠️ OpenAI API key may not be set correctly',
  })
}

