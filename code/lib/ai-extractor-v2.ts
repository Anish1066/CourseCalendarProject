import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import os from 'os'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedEvent {
  title: string
  date: string // ISO date string
  time?: string // Optional time (e.g., "2:00 PM", "11:59 PM")
  type: 'Exam' | 'Homework' | 'Project' | 'Other'
  course?: string
  description?: string
}

export interface ExtractionResult {
  course?: string
  events: ExtractedEvent[]
}

/**
 * Upload file to OpenAI and extract events using Assistants API
 */
export async function extractEventsFromFile(file: File): Promise<ExtractionResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  // Save file temporarily
  const tempDir = os.tmpdir()
  const tempFilePath = path.join(tempDir, `syllabus-${Date.now()}-${file.name}`)
  
  try {
    // Write file to temp location
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(tempFilePath, buffer)

    // Upload file to OpenAI
    console.log('Uploading file to OpenAI...', { filePath: tempFilePath, fileSize: buffer.length })
    let uploadedFile
    try {
      // Read file as a stream for OpenAI
      const fileStream = fs.createReadStream(tempFilePath)
      uploadedFile = await openai.files.create({
        file: fileStream,
        purpose: 'assistants',
      })
      console.log('File uploaded successfully, ID:', uploadedFile.id)
    } catch (uploadError) {
      console.error('File upload error:', uploadError)
      throw new Error(`Failed to upload file to OpenAI: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
    }

    // Create an assistant to process the file
    console.log('Creating assistant...')
    let assistant
    try {
      assistant = await openai.beta.assistants.create({
        model: 'gpt-4o-mini',
        instructions: `You are an expert at extracting academic calendar events from syllabi. 
Analyze the uploaded syllabus file and extract all important dates including exams, homework assignments, projects, and other deadlines.

Return a JSON object with this exact structure:
{
  "course": "Course code and name if found (e.g., 'CS 2120 - Discrete Math')",
  "events": [
    {
      "title": "Event title (e.g., 'Midterm Exam', 'Problem Set 3')",
      "date": "ISO date string (YYYY-MM-DD)",
      "time": "Time if specified (e.g., '2:00 PM', '11:59 PM') or null",
      "type": "One of: 'Exam', 'Homework', 'Project', 'Other'",
      "description": "Brief description if available"
    }
  ]
}

Rules:
- Extract ALL dates mentioned (exams, assignments, projects, deadlines)
- Use the current year or infer the academic year from context
- If no year is specified, assume the current academic year (2024-2025)
- Be thorough - include all deadlines
- Only include events with specific dates
- For recurring assignments, only include the first occurrence or a representative date
- Course name should be extracted from the syllabus header or title
- Always return valid JSON`,
        tools: [{ type: 'file_search' }],
      })
      console.log('Assistant created, ID:', assistant.id)
    } catch (assistantError) {
      console.error('Assistant creation error:', assistantError)
      // Clean up uploaded file
      try {
        await openai.files.del(uploadedFile.id)
      } catch {}
      throw new Error(`Failed to create assistant: ${assistantError instanceof Error ? assistantError.message : 'Unknown error'}`)
    }

    // Create an empty thread first
    console.log('Creating thread...')
    const thread = await openai.beta.threads.create()
    console.log('Thread created, ID:', thread.id)
    
    // Add message with file attachment to the thread
    console.log('Adding message with file attachment...')
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Please extract all academic calendar events (exams, homework, projects, deadlines) from this syllabus file and return them as JSON.',
      attachments: [
        {
          file_id: uploadedFile.id,
          tools: [{ type: 'file_search' }],
        },
      ],
    })
    console.log('Message added to thread')

    // Run the assistant
    console.log('Running assistant to extract events...')
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    })

    // Wait for completion (with timeout)
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    let attempts = 0
    const maxAttempts = 300 // 5 minutes max (300 seconds)
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Assistant run timed out after 5 minutes')
    }
    
    if (runStatus.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${runStatus.status}`)
    }

    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id)
    const lastMessage = messages.data[0]

    if (lastMessage.role !== 'assistant' || !lastMessage.content[0] || lastMessage.content[0].type !== 'text') {
      throw new Error('No valid response from assistant')
    }

    const responseText = lastMessage.content[0].text.value

    // Parse JSON from response (might be wrapped in markdown code blocks)
    let jsonText = responseText
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText) as ExtractionResult

    // Clean up: delete the assistant, thread, and file
    try {
      await openai.beta.assistants.del(assistant.id)
      await openai.files.del(uploadedFile.id)
    } catch (cleanupError) {
      console.warn('Cleanup error (non-critical):', cleanupError)
    }

    // Validate and clean the result
    if (!result.events || !Array.isArray(result.events)) {
      return { course: result.course || file.name, events: [] }
    }

    // Filter out invalid events
    result.events = result.events.filter((event) => {
      return event.title && event.date && event.type
    })

    return result
  } catch (error) {
    // Log comprehensive error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as any).cause,
    } : {}
    
    console.error('='.repeat(50))
    console.error('EXTRACTION ERROR - Full Details:')
    console.error(JSON.stringify(errorDetails, null, 2))
    console.error('='.repeat(50))
    
    // Re-throw with more context
    throw new Error(`Failed to extract events: ${errorMessage}`)
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    } catch (cleanupError) {
      console.warn('Temp file cleanup error:', cleanupError)
    }
  }
}

