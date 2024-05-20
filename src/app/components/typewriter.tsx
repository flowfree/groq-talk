'use client'

import { useState, useEffect } from 'react'

export function TypeWriter({ 
  text, 
  speed = 50,
  initialDelay = 1000,
  runIndefinitely = true,
  onCompleted,
}: { 
  text: string, 
  speed?: number
  initialDelay?: number
  runIndefinitely?: boolean
  onCompleted?: () => void
}) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [blinkingCursor, setBlinkingCursor] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setDisplayText('')
    setCurrentIndex(null)

    const timer = setTimeout(() => {
      setCurrentIndex(0)
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [text])

  useEffect(() => {
    setShowCursor(true)

    if (currentIndex === null) {
      return
    }

    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prevText) => prevText + text[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex === null ? prevIndex : prevIndex+1)
      } else if (runIndefinitely) {
        setBlinkingCursor(true)
        clearTimeout(timer)
      } else {
        setShowCursor(false)
        clearTimeout(timer)
        onCompleted && setTimeout(onCompleted, 500)
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [text, currentIndex])

  useEffect(() => {
    if (showCursor && blinkingCursor) {
      const timer = setInterval(() => {
        setShowCursor(c => !c)
      }, 250)
      
      return () => clearInterval(timer)
    }
  }, [blinkingCursor])

  return (
    <span className="line-clamp-1">
      {displayText}
      {showCursor && <span>{` _`}</span>}
    </span>  
  )
}
