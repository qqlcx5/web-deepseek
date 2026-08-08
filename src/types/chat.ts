// Re-export unified types for backward compatibility.
// All types now live in @/types/index.ts.
// Components can keep importing from @/types/chat — it just redirects.
export type {
  MessageRole,
  Source,
  Artifact,
  Attachment,
  ChatMessage as Message,
  Chat,
  Model,
  ModelListResponse,
  Workspace,
  ChatCompletionMessage,
  ChatCompletionRequest,
  ChatCompletionChunk,
  ChatCompletionResponse,
  ModalType,
  Command,
  PromptPreset,
  ThemeMode,
  MessageStatus,
  ChatStreamDelta,
} from './index'
