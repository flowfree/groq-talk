'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'

import { type Message } from '@/app/lib/types'
import { createThread } from './actions'
import { QuestionForm, MessageListItem } from './components'

interface SamplePrompt {
  title: string
  subtitle: string
  message: string
}

const prompts: SamplePrompt[] = [{
  title: 'Explains options trading',
  subtitle: 'if I am familiar with buying and selling stocks',
  message: 'Explain options trading in simple terms if I\'m familiar with buying and selling stocks.'
}, {
  title: 'Explain air turbulence',
  subtitle: 'to someone who has never flown before',
  message: 'Can you explain airplane turbulence to someone who has never flown before? Make it conversational and concise.'
}, {
  title: 'Tell me a fun fact',
  subtitle: 'about the Roman Empire',
  message: 'Tell me a random fun fact about the Roman Empire',
}, {
  title: 'Brainstorm edge cases',
  subtitle: 'for a function with birthdate as input, horoscope as output',
  message: 'Can you brainstorm some edge cases for a function that takes birthdate as input and returns the horoscope?'
}, {
  title: 'Design a database schema',
  subtitle: 'for an online merch store',
  message: 'Design a database schema for an online merch store.'
}, {
  title: 'Write a SQL query',
  subtitle: '\'that adds a "status" column to an "orders" table\'',
  message: '\'Give me a SQL query to add a "status" column to an orders table that defaults to PENDING. Set it to COMPLETE if "completed_at" is set.\''
}, {
  title: 'Create a workout plan',
  subtitle: 'for resistance training',
  message: 'I need to start resistance training. Can you create a 7-day workout plan for me to ease into it?'
}, {
  title: 'Show me a code snippet',
  subtitle: 'of a website\'s sticky header',
  message: 'Show me a code snippet of a website\'s sticky header in CSS and JavaScript.'
}, {
  title: 'Plan a trip',
  subtitle: 'to see the best of New York in 3 days',
  message: 'I\'ll be in New York for 3 days. Can you recommend what I should do to see the best of the city?'
}, {
  title: 'Help me debug',
  subtitle: 'a linked list problem',
  message: 'What are some reasons why my linked list would appear empty after I tried reversing it?'
}]

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [samplePrompts, setSamplePrompts] = useState<SamplePrompt[]>([])
  const router = useRouter()

  const { data: session } = useSession()
  if (!session) {
    redirect('/')
  }

  useEffect(() => {
    const shuffled = prompts.sort(() => 0.5 - Math.random())
    setSamplePrompts(shuffled.slice(0, 4))
  }, [])

  async function handleSubmit(question: string) {
    const newMessage: Message = { role: 'user', content: question }

    localStorage.setItem('NewChat', JSON.stringify(newMessage))
    setMessages(m => [...m, newMessage, { role: 'assistant', content: '' }])

    const { success, threadId } = await createThread(question)
    router.push(`/chat/${threadId}`)
  }

  return (
    <>
      <div className="grow">
        <div className="mt-12 md:mt-3 max-w-sm px-2 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <p className="text-sm">
            <strong>Model:</strong> 
            <span className="ml-2">llama3-70b-8192</span>
          </p>
        </div>
      </div>

      <div className="sticky w-content bottom-0">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 max-w-md px-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
            {messages.length === 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {samplePrompts.map((prompt, index) => (
                  <li 
                    key={index} 
                    className="py-2 px-4 border rounded-lg border-gray-200 cursor-pointer"
                    onClick={() => handleSubmit(prompt.message)}
                  >
                    <div className="text-sm">
                      <h3 className="text-gray-900 font-bold">
                        {prompt.title}
                      </h3>
                      <p className="text-gray-400 line-clamp-1">
                        {prompt.subtitle}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full bg-white">
            <div className="max-w-md px-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto pb-4">
              <QuestionForm onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
