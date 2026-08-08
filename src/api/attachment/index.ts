import { request } from '@/utils/request'
import type {
  Attachment,
  AttachmentListResponse,
  UploadPresignedUrl,
  UploadConfirmResult,
  ExtractTextResult,
} from '@/types/attachment'

const BASE = '/api/attachments'

/** 获取预签名上传 URL */
export function getUploadUrl(fileName: string, fileSize: number, mimeType: string) {
  return request.post<UploadPresignedUrl>(`${BASE}/upload-url`, {
    fileName,
    fileSize,
    mimeType,
  })
}

/** 确认上传完成，触发解析 */
export function confirmUpload(attachmentId: string) {
  return request.post<UploadConfirmResult>(`${BASE}/${attachmentId}/confirm`)
}

/** 获取附件元数据 */
export function getAttachment(attachmentId: string) {
  return request.get<Attachment>(`${BASE}/${attachmentId}`)
}

/** 下载附件 */
export function downloadAttachment(attachmentId: string) {
  return request.get<Blob>(`${BASE}/${attachmentId}/download`, undefined, {
    responseType: 'blob',
  })
}

/** 删除附件 */
export function deleteAttachment(attachmentId: string) {
  return request.delete(`${BASE}/${attachmentId}`)
}

/** 获取对话所有附件 */
export function getConversationAttachments(conversationId: string) {
  return request.get<AttachmentListResponse>(
    `/api/conversations/${conversationId}/attachments`
  )
}

/** 提取文本内容 */
export function extractText(attachmentId: string) {
  return request.post<ExtractTextResult>(`${BASE}/${attachmentId}/extract`)
}
