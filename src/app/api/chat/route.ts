import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { type Message } from '@/app/lib/types'

const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
})

const SYSTEM_PROMPT = `
You are a helpful assistant and you will return responses in valid Markdown format.

If the response contains code blocks, make sure that you specify the programming language so the frontend can properly display the syntax highlighting. e.g:

\`\`\`python 
print('hello, world!')
\`\`\`
`;

const systemMessage: Message = {
  'role': 'system',
  'content': SYSTEM_PROMPT
}

export async function POST(request: Request) {
  const { messages } = await request.json()
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'llama3-70b-8192',
      temperature: 0.7,
      stream: true,
      messages: [systemMessage, ...messages]
    })
    const stream = OpenAIStream(chatCompletion)
    return new StreamingTextResponse(stream)
  } catch (err) {
    const error = `Error communicating wih OpenAI: ${err}`
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
