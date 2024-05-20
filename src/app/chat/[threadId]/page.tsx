'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

import { 
  getMessages, 
  addMessage, 
  updateMessage,
  deleteMessage,
  deleteMessagesStartingFrom 
} from '../actions'
import { type Message } from '@/app/lib/types'
import { AlertError } from '@/app/components'
import { MessageListItem, QuestionForm } from '../components'

export default function Page({ 
  params: { threadId } 
}: {
  params: { threadId: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')

  const [displayLoading, setDisplayLoading] = useState(false)
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  const { data: session } = useSession()
  if (!session) {
    redirect('/')
  }

  useEffect(() => {
    console.log(messages)
  }, [messages])

  // Fetch all saved messages on page load
  useEffect(() => {
    async function fetchInitialMessages() {
      const item = localStorage.getItem('NewChat')
      if (item) {
        setMessages([JSON.parse(item)])
        localStorage.removeItem('NewChat')
      } else {
        setDisplayLoading(true)
      }

      try {
        setMessages(await getMessages(threadId))
      } finally {
        setDisplayLoading(false)
        setInitialMessagesLoaded(true)
      }
    }

    fetchInitialMessages()
  }, [threadId]) 

  // After the user submits their question, trigger the generate chat completion
  useEffect(() => {
    if (initialMessagesLoaded) {
      // Check if user has submitted their question
      if ((messages.length % 2) === 1 && isStreaming === false) {
        setAutoScroll(true)
        generateCompletion()
      }
    }
  }, [initialMessagesLoaded, messages, isStreaming])

  // Scroll to the bottom of the page on each message changes
  useEffect(() => {
    if (autoScroll) {
      document.documentElement.scrollTop = document.documentElement.scrollHeight;
      document.body.scrollTop = document.body.scrollHeight;
    }
  }, [messages, autoScroll])

  async function handleUserMessage(content: string) {
    const role = 'user'
    setMessages(m => [...m, { role, content }])

    const { id } = await addMessage(threadId, 'user', content)
    setMessages(m => [...m.slice(0, -1), { id, role, content }])
  }

  async function handleEditMessage(id: string, content: string) {
    const index = messages.findIndex(m => m.id === id)

    if (messages[index].role === 'user') {
      setMessages(m => [...m.slice(0, index)])
      await deleteMessagesStartingFrom(id)
      handleUserMessage(content)
    } else {
      const { success } = await updateMessage(id, content)
      if (success) {
        setMessages(m => m.map(item => item.id === id ? { ...item, content } : item))
      }
    }
  }

  async function handleDeleteMessage(id: string) {
    const index = messages.findIndex(m => m.id === id)

    let nextMessage: Message | null = null
    if (index < messages.length - 1) {
      nextMessage = messages[index+1]
    }

    setMessages(m => {
      setAutoScroll(false)
      return [...m.slice(0, index), ...m.slice(index+2)]
    })

    await deleteMessage(id)
    if (nextMessage && nextMessage.id) {
      await deleteMessage(nextMessage.id)
    }
  }

  async function generateCompletion() {
    setIsStreaming(true)

    const response = await fetch('/api/chat', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: messages.map(({ role, content }) => ({ role, content })) 
      })
    })

    if (response.status === 500) {
      const { error } = await response.json()
      setError(error)
      return
    }

    const role = 'assistant'
    setMessages(m => [...m, { role: 'assistant', content: '...' }])

    const stream = response.body
    if (stream === null) {
      throw new Error('Stream is null')
    }

    const reader = stream.getReader()
    const textDecoder = new TextDecoder('utf-8')
    let content = ''

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          const { success, id } = await addMessage(threadId, role, content)
          setMessages(m => ([...m.slice(0, -1), { id, role, content }]))
          break
        }
        content += textDecoder.decode(value)
        setMessages(m => ([...m.slice(0, -1), { role, content }]))
      }
    } catch (error) {
      console.error(`Error reading from stream: ${error}`)
    } finally {
      setIsStreaming(false)
      reader.releaseLock()
    }
  }

  return (
    <>
      <div className="grow pt-8 -mb-4 md:pt-0">
        <div className="w-content">
          {displayLoading && (
            <div className="max-w-sm px-2 py-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
              <span className="text-sm">
                Loading...
              </span>
            </div>
          )}        

          <ul>
            {messages.map((message, index) => (
              <MessageListItem 
                key={message.id || index} 
                message={message} 
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            ))}
            {messages.length%2 === 1 && (
              <MessageListItem 
                key={`thinking`}
                message={{ role: 'assistant', content: '' }}
              />
            )}
          </ul>

          {error && (
            <div className="max-w-sm px-2 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
              <AlertError>{error}</AlertError>
            </div>
          )}
        </div>
      </div>

      <div className="sticky w-content bottom-0">
        <div className="w-full h-12 bg-gradient-to-t from-white to-transparent">
        </div>
        <div className="w-full bg-white">
          <div className="max-w-sm px-2 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto pb-4">
            <QuestionForm onSubmit={handleUserMessage} />
          </div>
        </div>
      </div>
    </>
  )
}
