import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: Request) {
  const { messages } = await request.json()
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'llama3-70b-8192',
      temperature: 0.7,
      stream: true,
      messages
    })
    const stream = OpenAIStream(chatCompletion)
    return new StreamingTextResponse(stream)
  } catch (err) {
    const error = `Error communicating wih OpenAI: ${err}`
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
