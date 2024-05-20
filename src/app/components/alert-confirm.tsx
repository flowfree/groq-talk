'use client'

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function AlertConfirm({
  children,
  onConfirm,
  onCancel,
  className = ''
}: {
  children: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  className?: string
}) {
  return (
    <div className={`w-full flex gap-2 p-2 text-red-800 bg-red-50 border-red-100 rounded-md  ${className}`}>
      <div className="grow">
        {children}
      </div>
      <div className="flex gap-4 font-bold">
        <button 
          className="flex gap-1 items-center text-red-800 hover:text-red-600"
          onClick={e => {
            e.preventDefault()
            onConfirm()
          }}
        >
          <CheckIcon className="w-4 h-4" />
          Yes
        </button>
        <button 
          className="flex gap-1 items-center text-green-700 hover:text-green-600"
          onClick={e => {
            e.preventDefault()
            onCancel()
          }}
        >
          <XMarkIcon className="w-4 h-4" />
          No
        </button>
      </div>
    </div>
  )
}
