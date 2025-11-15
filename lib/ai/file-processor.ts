export interface ExtractedText {
  text: string
  filename: string
  fileType: string
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = file.name
  const fileType = file.type

  // Only handle text files
  if (fileType === 'text/plain' || filename.endsWith('.txt')) {
    const text = buffer.toString('utf-8')
    console.log('Text file extracted, length:', text.length, 'characters')
    return {
      text,
      filename,
      fileType: 'txt',
    }
  }

  throw new Error(`Only TXT files are supported. Received file type: ${fileType || 'unknown'}`)
}

