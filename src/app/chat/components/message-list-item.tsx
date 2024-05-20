'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Message } from '@/app/lib/types'
import { Avatar, BlinkingCursor, AlertConfirm, AlertWarning } from '@/app/components'
import { Markdown } from './markdown'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export function MessageListItem({
  message,
  onEditMessage,
  onDeleteMessage
}: {
  message: Message
  onEditMessage?: (id: string, question: string) => void
  onDeleteMessage?: (id: string) => void
}) {
  enum Mode {
    Normal,
    Editing,
    ConfirmDeletion,
    Deleting,
  }

  const { id, role, content } = message

  const [editMessage, setEditMessage] = useState(content)
  const [mode, setMode] = useState<Mode>(Mode.Normal)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (mode === Mode.Editing && inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
      inputRef.current.focus()
    } else if (mode === Mode.Normal) {
      setEditMessage(content)
    }
  }, [mode, editMessage])

  function handleEditMessage() {
    setMode(Mode.Normal)
    if (id && onEditMessage) {
      onEditMessage(id, editMessage)
    }
  }

  function handleDeleteMessage() {
    setMode(Mode.Deleting)
    if (id && onDeleteMessage) {
      onDeleteMessage(id)
    }
  }

  return (
    <li className={`group py-2 ` + (role === 'assistant' ? 'bg-gray-50 border-y border-y-gray-200/75' : '')}>
      <div className="max-w-sm px-2 text-sm sm:px-0 sm:text-base sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex gap-4 ">
        <div className="shrink-0 first-letter:lg:min-w-fit pt-2">
          <Avatar 
            role={role} 
            name={session?.user?.name || session?.user?.email} 
            image={session?.user?.image}
          />
        </div>
        <div className="relative grow overflow-auto sm:overflow-hidden flex flex-row gap-2">
          <div className="grow w-full">
            {mode === Mode.Normal && (
              content === '' ? (
                <div className="my-4">
                  <BlinkingCursor />
                </div>
              ) : (
                <Markdown content={content} />
              )
            )}

            {mode === Mode.Editing && (
              <textarea 
                ref={inputRef}
                rows={1}
                className="my-4 w-full outline-none border-0 resize-none bg-white"
                value={editMessage}
                onChange={e => setEditMessage(e.target.value)}
              />
            )}

            {mode === Mode.ConfirmDeletion && (
              <>
                <AlertConfirm 
                  className="my-4 text-sm"
                  onCancel={() => setMode(Mode.Normal)}
                  onConfirm={handleDeleteMessage}
                >
                  This message will be deleted. Are you sure?
                </AlertConfirm>
                <Markdown content={content} />
              </>
            )}

            {mode === Mode.Deleting && (
              <>
                <Markdown content={content} />
                <AlertWarning className="my-4 text-sm">
                  Deleting...
                </AlertWarning>
              </>
            )}
          </div>

          {mode === Mode.Normal && (
            <div className="absolute top-0 right-0 transform -translate-y-[18px] -sm:translate-y-full mt-4 w-content shrink-0">
              <button
                className="invisible group-hover:visible p-1 rounded-md bg-transparent hover:bg-gray-200"
                onClick={() => setMode(Mode.Editing)}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              {role === 'user' && (
                <button
                  className="invisible group-hover:visible p-1 rounded-md bg-transparent hover:bg-gray-200"
                  onClick={() => setMode(Mode.ConfirmDeletion)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {mode === Mode.Editing && (
        <div className="mb-4 max-w-sm text-sm sm:text-base sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex gap-4 justify-center">
          <button 
            className="py-2 px-4 rounded-md bg-indigo-700 hover:bg-indigo-600 text-white text-sm"
            onClick={handleEditMessage}
          >
            Save &amp; Submit
          </button>
          <button 
            className="py-2 px-4 rounded-md border border-gray-300 hover:text-gray-700 text-sm"
            onClick={() => setMode(Mode.Normal)}
          >
            Cancel
          </button>
        </div>
      )}

    </li>
  )
}
