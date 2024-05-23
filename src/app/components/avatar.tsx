'use client'

import { useState } from 'react'

export function Avatar({
  role,
  name,
  image
}: {
  role: 'system' | 'assistant' | 'user',
  name?: string | null
  image?: string | null 
}) {
  const [imageError, setImageError] = useState(false)

  if (role === 'user') {
    if (image && imageError === false) {
      return <img src={image} className="w-9 h-auto bg-white" onError={() => setImageError(true)} alt="" />
    } else {
      return (
        <span className="w-9 h-9 bg-violet-200 text-xl font-bold text-violet-800 flex items-center justify-center">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </span>
      )
    }
  } else {
    return (
      <span className="w-9 h-9 flex items-center justify-center bg-violet-200 text-xl text-violet-800 font-bold">
        G
      </span>
    )
  }
}
