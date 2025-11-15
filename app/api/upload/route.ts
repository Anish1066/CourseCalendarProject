import { NextRequest, NextResponse } from 'next/server'
import { extractEventsFromFile } from '@/lib/ai/extractor'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max for processing (Assistants API can take longer)

export async function GET() {
  return NextResponse.json({
    message: 'Upload endpoint - use POST to upload files',
    usage: 'POST /api/upload with FormData containing a "file" field',
    supportedFormats: ['TXT'],
    maxSize: '10MB',
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload endpoint called')
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - only TXT files
    const allowedTypes = ['text/plain']
    const allowedExtensions = ['.txt']

    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Only TXT files are supported. Please upload a .txt file.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Extract events directly from file using OpenAI Chat API
    console.log('Processing file with OpenAI...')
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY is not configured. Please set it in .env.local')
    }
    
    const extractionResult = await extractEventsFromFile(file)
    console.log('Events extracted:', extractionResult.events.length)

    return NextResponse.json({
      success: true,
      course: extractionResult.course || file.name,
      events: extractionResult.events,
      filename: file.name,
    })
  } catch (error) {
    // Log the full error with all details
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : undefined
    
    console.error('='.repeat(50))
    console.error('UPLOAD ERROR - Full Details:')
    console.error('Error Name:', errorName)
    console.error('Error Message:', errorMessage)
    console.error('Error Stack:', errorStack)
    if (error instanceof Error && 'cause' in error) {
      console.error('Error Cause:', (error as any).cause)
    }
    console.error('='.repeat(50))
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          name: errorName,
          message: errorMessage,
          stack: errorStack,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

