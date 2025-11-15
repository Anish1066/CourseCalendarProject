import OpenAI from 'openai'

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

export async function extractEventsFromText(text: string, filename: string): Promise<ExtractionResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const prompt = `You are an expert at extracting academic calendar events from syllabi. Analyze the following syllabus text and extract all important dates including exams, homework assignments, projects, and other deadlines.

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

Syllabus text:
${text.substring(0, 15000)}` // Limit to avoid token limits

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that extracts academic calendar events from syllabi. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as ExtractionResult

    // Validate and clean the result
    if (!result.events || !Array.isArray(result.events)) {
      return { course: result.course || filename, events: [] }
    }

    // Filter out invalid events
    result.events = result.events.filter((event) => {
      return event.title && event.date && event.type
    })

    return result
  } catch (error) {
    console.error('Error extracting events:', error)
    throw new Error(`Failed to extract events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

