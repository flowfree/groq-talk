'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TypeWriter } from '@/app/components'
import { 
  renameThread, 
  deleteThread,
  suggestNewThreadTitle
} from '../chat/actions'

import { 
  ChatBubbleLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export function ThreadListItem({
  id,
  title,
  active
}: {
  id: string
  title: string
  active: boolean
}) {
  enum Mode {
    Normal,
    Editing,
    DeleteConfirmation,
    Deleting,
    AutoTyping
  }

  const [mode, setMode] = useState<Mode>(Mode.Normal)
  const [displayTitle, setDisplayTitle] = useState(title)
  const [editTitle, setEditTitle] = useState(title)
  const [isDeleted, setIsDeleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSuggestionTitle() {
      const { title } = await suggestNewThreadTitle(id)
      if (title) {
        const { success } = await renameThread(id, title) 
        if (success) {
          setDisplayTitle(title)
          setEditTitle(title)
          setMode(Mode.AutoTyping)
        } else {
          setDisplayTitle(editTitle)
        }
      }
    }

    if (active && displayTitle === 'New Chat') {
      fetchSuggestionTitle()
    }
  }, [active, displayTitle])

  async function handleRename(e?: React.FormEvent) {
    if (e) {
      e.preventDefault()
    }
    const { success } = await renameThread(id, editTitle) 
    setDisplayTitle(editTitle)
    document.title = editTitle
    setMode(Mode.Normal)
  }

  async function handleDelete() {
    setMode(Mode.Deleting)
    const { success } = await deleteThread(id)
    if (success) {
      setIsDeleted(true)
      router.push('/chat')
    }
  }

  if (isDeleted) {
    return null
  }

  return (
    <li className={`${active ? 'rounded-md bg-violet-900' : ''} text-gray-300 p-2 text-sm w-full`}>
      <div className="flex gap-2 items-center">
        <ChatBubbleLeftIcon className="shrink-0 w-5 h-5" />

        {mode === Mode.Editing ? (
          <form onSubmit={handleRename}>
            <input 
              type="text" 
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-stone-800 border border-blue-700 outline-none"
            />
          </form>
        ) : (mode === Mode.AutoTyping ? (
          <TypeWriter 
            text={displayTitle} 
            runIndefinitely={false} 
            onCompleted={() => {
              setMode(Mode.Normal)
              document.title = displayTitle
            }}
          />
        ) : (
          <Link href={`/chat/${id}`} className="grow line-clamp-1" title={displayTitle}>
            {displayTitle}
          </Link>
        ))}

        {mode === Mode.Editing && (
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleRename}
            >
              <CheckIcon className="w-4 h-4 hover:text-green-400" />
            </button>
            <button onClick={() => setMode(Mode.Normal)}>
              <XMarkIcon className="w-4 h-4 hover:text-red-400" />
            </button>
          </div>
        )}

        {mode === Mode.Normal && active && displayTitle !== 'New Chat' && (
          <div className="flex gap-2 items-center">
            <button onClick={() => setMode(Mode.Editing)}>
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setMode(Mode.DeleteConfirmation)}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {mode === Mode.DeleteConfirmation && (
        <div className="p-2 m-2 rounded-sm bg-red-100 text-red-900 text-sm">
          <p>
            Chat will be deleted. Are you sure?
          </p>
          <p className="mt-2 flex flex-row-reverse gap-2">
            <button 
              className="px-1 flex gap-1 items-center rounded-md text-green-800 border border-green-600/50 hover:border-green-600 text-xs"
              onClick={() => setMode(Mode.Normal)}
            >
              <XMarkIcon className="w-4 h-4" />
              No
            </button>
            <button 
              className="px-1 flex gap-1 items-center rounded-md border border-red-400/50 hover:border-red-400 text-xs"
              onClick={handleDelete}
            >
              <CheckIcon className="w-4 h-4" />
              Yes
            </button>
          </p>
        </div>
      )}

      {mode === Mode.Deleting && (
        <div className="p-2 m-2 rounded-sm bg-red-100 text-red-900 text-sm">
          Deleting chat...
        </div>
      )}
    </li>
  )
}