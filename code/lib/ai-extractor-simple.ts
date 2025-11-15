import OpenAI from 'openai'
import { extractTextFromFile } from './file-processor'

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
 * Simplest approach: Extract text from file, send to Chat API
 */
export async function extractEventsFromFile(file: File): Promise<ExtractionResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  // Extract text from file
  console.log('Extracting text from file:', file.name, file.type)
  let extractedText
  try {
    extractedText = await extractTextFromFile(file)
    console.log('Text extracted, length:', extractedText.text.length)
  } catch (extractError) {
    console.error('Text extraction failed:', extractError)
    throw new Error(`Failed to extract text from file: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`)
  }

  if (!extractedText.text || extractedText.text.length === 0) {
    throw new Error('No text could be extracted from the file. Please ensure the file contains readable text.')
  }

  // Send to OpenAI Chat API
  // Use full text (up to 200k chars) to ensure we capture everything
  const fullText = extractedText.text
  const textToSend = fullText.length > 200000 ? fullText.substring(0, 200000) : fullText
  
  console.log('Sending to OpenAI Chat API...', {
    fullLength: fullText.length,
    sendingLength: textToSend.length,
  })
  
  let response
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting academic calendar events from syllabi. Your task is to find EVERY single date, deadline, exam, assignment, project, and important event mentioned in the syllabus. Be extremely thorough and comprehensive. Always return valid JSON.`,
        },
        {
          role: 'user',
          content: `Extract ALL important dates, deadlines, exams, homework assignments, projects, and events from this syllabus. Read through the ENTIRE document carefully and extract EVERY date mentioned:

${textToSend}

Return a JSON object with this exact structure:
{
  "course": "Course code and name if found (e.g., 'CS 2120 - Discrete Math')",
  "events": [
    {
      "title": "Event title (e.g., 'Midterm Exam', 'Problem Set 3', 'Final Project Due')",
      "date": "ISO date string (YYYY-MM-DD)",
      "time": "Time if specified (e.g., '2:00 PM', '11:59 PM') or null",
      "type": "One of: 'Exam', 'Homework', 'Project', 'Other'",
      "description": "Brief description if available"
    }
  ]
}

CRITICAL RULES - READ CAREFULLY:
1. Extract EVERY date mentioned in the document - do not skip any
2. Look through the ENTIRE document, including:
   - Course schedule sections
   - Assignment sections
   - Exam schedules
   - Project deadlines
   - Important dates sections
   - Any calendar or timeline information
3. Include ALL types of events:
   - Exams (midterms, finals, quizzes)
   - Homework assignments
   - Projects and project milestones
   - Paper deadlines
   - Lab due dates
   - Discussion posts
   - Any other deadlines or important dates
4. For dates without a year, infer from context:
   - If the syllabus mentions a semester (Fall 2024, Spring 2025), use that year
   - If no year is specified, assume the current academic year (2024-2025)
   - For months, if it's clearly a future semester, use the appropriate year
5. Be thorough - scan the entire document multiple times if needed
6. Include events even if they're mentioned in different sections
7. If a date appears multiple times, include it once with the most complete information
8. Only include events with specific dates (not "TBD" or "To be announced")

IMPORTANT: This is a comprehensive extraction. You must find ALL dates, not just the first few. Count how many dates you found and make sure you've covered the entire document.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for more consistent, thorough extraction
    })
    console.log('OpenAI API response received')
  } catch (apiError) {
    console.error('OpenAI API error:', apiError)
    throw new Error(`OpenAI API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`)
  }

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  let result: ExtractionResult
  try {
    result = JSON.parse(content) as ExtractionResult
  } catch (parseError) {
    console.error('JSON parse error:', parseError)
    console.error('Response content:', content.substring(0, 500))
    throw new Error(`Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
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
}

