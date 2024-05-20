'use client'

import { useEffect, useState } from 'react'

export function BlinkingCursor() {
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowCursor((prevShowCursor) => !prevShowCursor)
    }, 500)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <span className="inline-block">
      {showCursor ? `_ ` : ` `}
    </span>
  )
}
