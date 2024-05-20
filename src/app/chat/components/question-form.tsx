'use client'

import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export function QuestionForm({
  onSubmit
}: {
  onSubmit: (question: string) => void
}) {
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    autoResizeTextarea()
  }, [textareaRef])

  useEffect(() => {
    if (question === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [question])

  function handleSubmit() {
    if (question) {
      onSubmit(question)
      setQuestion('')
    }
  }

  function handleTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value } = e.target
    setQuestion(value)
    if (value) {
      autoResizeTextarea()
    }
  }

  function autoResizeTextarea() {
    if (textareaRef.current) {
      const t = textareaRef.current
      t.style.height = 'auto' 
      t.style.overflow = 'scroll'
      t.style.height = Math.min(t.scrollHeight, 200) + 'px'
      t.style.overflow = 'hidden'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form className="w-full">
      <div className="p-4 pb-3 mb-3 flex gap-2 rounded-lg shadow-[0_0px_20px_rgba(0,0,0,0.2)]">
        <textarea 
          ref={textareaRef}
          rows={1}
          className="grow border-0 outline-none resize-none py-1 text-sm sm:text-base sm:py-0"
          placeholder="Send a message"
          value={question}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDown}
        />
        <div className="mb-1 flex flex-col-reverse">
          <button
            className="text-indigo-600 hover:text-indigo-500"
            onClick={e => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      <p className="hidden sm:block mt-2 text-center text-gray-500 text-xs">
        Chat with advanced LLM models using the <a href="https://console.groq.com/docs/quickstart" className="border-b border-b-gray-400">Grok API</a>.
      </p>
    </form>
  )
}
