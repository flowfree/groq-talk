'use server'

import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { 
  PrismaClient, 
  Role, 
  type Message 
} from '@prisma/client'

const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
})

const prisma = new PrismaClient()

/**
 * Create a new thread with the given argument as the first message  
 */
export async function createThread(firstMessage: string) {
  const session = await getServerSession()

  try {
    const thread = await prisma.thread.create({
      data: {
        title: 'New Chat',
        user: { connect: { email: session?.user?.email || '' } },
        messages: {
          create: [
            { role: Role.user, content: firstMessage }
          ]
        }
      }
    })
    return { success: true, message: 'Successfully created new thread.', threadId: thread.id }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed creating new thread.' }
  }
}

/**
 * Get all threads
 */
export async function getThreads() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const { email } = session.user
    const result = await prisma.thread.findMany({
      where: { user: { email  } },
      orderBy: { createdAt: 'desc' }
    })

    const threads = result.map(({ id, title }) => ({ id, title }))
    return { success: true, threads }
  } catch (err) {
    return { success: false, message: `${err}` }
  }
}

/**
 * Rename the title of the thread 
 */
export async function renameThread(id: string, title: string) {
  try {
    await prisma.thread.update({
      data: { title },
      where: { id }
    })
    return { success: true }
  } catch (err) {
    return { success: false, message: `${err}` }
  }
}

/**
 * Delete the specified thread
 */
export async function deleteThread(id: string) {
  try {
    await prisma.thread.delete({ where: { id } })
    return { success: true }
  } catch (err) {
    return { success: false, message: `${err}` }
  }
}

export async function suggestNewThreadTitle(threadId: string) {
  let message: Message | null

  try {
    message = await prisma.message.findFirst({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    })
  } catch (error) {
    return { success: false, message: `${error}` }
  }

  if (message === null) {
    return { success: false, message: 'No message for the given thread.' }
  }

  const content = `Extract suitable title for a chat, make it short and concise with a maximum of 5 words. Don't use any emoticons or wrap it in double quotes. The first message from the user is:\n\n${message.content}`
  const completion = await openai.chat.completions.create({
    model: 'llama3-70b-8192',
    temperature: 0,
    messages: [{ role: 'user', content }]
  })

  if (completion.choices[0].message.content) {
    let { content } = completion.choices[0].message
    const title = content?.replace(/^"(.*)"$/, '$1')
    return { success: true, title }
  } else {
    return { success: false, message: 'Failed retrieving OpenAI response.' }
  }
}

/**
 * Get all messages for the given thread
 */
export async function getMessages(threadId: string) {
  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' }
  })

  return messages.map(({ id, role, content }) => ({ id, role, content }))
}

/**
 * Add new message for the given thread 
 */
export async function addMessage(threadId: string, role: 'user' | 'assistant', content: string) {
  const message = await prisma.message.create({
    data: { threadId, role, content }
  })

  return { success: true, id: message.id }
}

/**
 * Update a single message
 */
export async function updateMessage(id: string, content: string) {
  try {
    await prisma.message.update({
      where: { id },
      data: { content }
    })
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

/**
 * Delete a single message
 */
export async function deleteMessage(id: string) {
  try {
    await prisma.message.delete({ where: { id } })
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

/**
 * Delete a message and its children
 */
export async function deleteMessagesStartingFrom(id: string) {
  try {
    const message = await prisma.message.findFirst({ where: { id } })
    if (message) {
      const { threadId, createdAt } = message
      await prisma.message.deleteMany({
        where: {
          threadId,
          createdAt: { gte: createdAt }
        }
      })
    }
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}
