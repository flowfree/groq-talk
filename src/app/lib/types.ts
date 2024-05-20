export interface Thread {
  id: string
  title: string
}

export interface Message {
  id?: string
  role: 'system' | 'assistant' | 'user'
  content: string
}
