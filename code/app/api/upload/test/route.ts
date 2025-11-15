import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test PDF parsing
    let pdfParseTest = 'not tested'
    try {
      const pdfParseModule = require('pdf-parse')
      pdfParseTest = typeof pdfParseModule.PDFParse === 'function' ? '✅ PDF parsing available' : '❌ PDFParse not found'
    } catch (e) {
      pdfParseTest = `❌ PDF parse error: ${e instanceof Error ? e.message : 'Unknown'}`
    }

    // Test OpenAI
    let openaiTest = 'not tested'
    try {
      const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
      openaiTest = hasKey ? '✅ OpenAI key configured' : '❌ OpenAI key missing or placeholder'
    } catch (e) {
      openaiTest = `❌ OpenAI check error: ${e instanceof Error ? e.message : 'Unknown'}`
    }

    return NextResponse.json({
      status: 'ok',
      tests: {
        pdfParse: pdfParseTest,
        openai: openaiTest,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

