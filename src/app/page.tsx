'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { TypeWriter } from '@/app/components'

export default function Page() {
  const { data: session } = useSession()
  const [index, setIndex] = useState(0)
  const [heading, setHeading] = useState('')
  const [subheading, setSubheading] = useState('')

  if (session) {
    redirect('/chat')
  } else {
    signIn()
  }
}
