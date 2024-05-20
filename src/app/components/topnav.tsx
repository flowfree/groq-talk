'use client'

import { Sidebar } from '@/app/components'

export function TopNav() {
  return (
    <div className="relative sm:hidden">
      <div className="fixed top-0 w-full p-2 bg-stone-800 text-white text-sm text-center">
        ChatGPT clone
      </div>

      <div className="fixed top-0 left-0 h-screen flex flex-col">
        <Sidebar mobile={true} />
      </div>
    </div>
  )
}
