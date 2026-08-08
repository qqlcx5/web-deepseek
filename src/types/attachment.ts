/**
 * 附件系统模块类型定义
 * 对应详细设计 §6.2
 */

// === 附件实体 ===
export interface Attachment {
  id: string
  conversationId: string
  messageId?: string
  fileName: string
  fileType: 'image' | 'pdf' | 'document' | 'text' | 'code' | 'other'
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  extractedText?: string
  status: AttachmentStatus
  error?: string
  createdAt: number
}

export type AttachmentStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error'

// === 消息中携带的附件引用 ===
export interface AttachmentRef {
  id: string
  name: string
  type: string
  size: number
  url: string
}

// === 上传预签名 ===
export interface UploadPresignedUrl {
  uploadUrl: string
  attachmentId: string
  expiresAt: number
}

// === 上传确认 ===
export interface UploadConfirmResult {
  attachment: Attachment
  extractedText?: string
}

// === 附件列表响应 ===
export interface AttachmentListResponse {
  attachments: Attachment[]
  total: number
}

// === 文本提取结果 ===
export interface ExtractTextResult {
  attachmentId: string
  text: string
}
