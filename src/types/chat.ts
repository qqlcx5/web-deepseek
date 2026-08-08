export interface Source {
  name: string
  domain: string
  url: string
}

export interface Artifact {
  name: string
  meta: string
}

export interface Attachment {
  id: string
  name: string
  size: string
}

export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
  model?: string
  rating?: string
  branches?: number
  activeBranch?: number
  loading?: boolean
  sources?: Source[]
  artifact?: Artifact
}

export interface Model {
  id: string
  name: string
  color: string
  description: string
  tags: string[]
}

export interface Workspace {
  id: string
  name: string
  color: string
  count: number
}

export interface Chat {
  id: string
  title: string
  preview: string
  pinned?: boolean
}

export interface Command {
  title: string
  description: string
  icon: string
  shortcut?: string
  action: string
}

export interface PromptPreset {
  name: string
  value: string
}
