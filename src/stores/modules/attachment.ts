import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getUploadUrl,
  confirmUpload,
  getAttachment,
  deleteAttachment as apiDeleteAttachment,
  getConversationAttachments,
  extractText as apiExtractText,
} from '@/api/attachment'
import type {
  Attachment,
  AttachmentRef,
} from '@/types/attachment'

interface UploadTask {
  attachmentId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  abortController: AbortController
}

export const useAttachmentStore = defineStore('attachment', () => {
  // ---- 状态 ----
  const uploading = ref<Map<string, UploadTask>>(new Map())
  const conversationAttachments = ref<Map<string, Attachment[]>>(new Map())
  const loading = ref(false)

  // ---- 计算属性 ----
  const uploadingCount = computed(() => uploading.value.size)

  const uploadTasks = computed(() =>
    Array.from(uploading.value.values())
  )

  // ---- Actions ----

  /** 单文件上传 */
  async function uploadFile(
    conversationId: string,
    file: File
  ): Promise<Attachment | null> {
    // 文件类型校验
    const allowedTypes: Record<string, string> = {
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'image/svg+xml': 'image',
      'application/pdf': 'pdf',
      'application/msword': 'document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
      'text/plain': 'text',
      'text/markdown': 'text',
      'text/csv': 'text',
      'application/json': 'code',
      'text/javascript': 'code',
      'text/typescript': 'code',
      'text/html': 'code',
      'text/css': 'code',
      'text/x-python': 'code',
      'text/x-java': 'code',
    }

    const fileType = allowedTypes[file.type] || 'other'
    const maxSize = 20 * 1024 * 1024 // 20MB

    if (file.size > maxSize) {
      ElMessage.warning(`文件 "${file.name}" 超过 20MB 限制`)
      return null
    }

    const abortController = new AbortController()

    try {
      // 1. 获取预签名 URL
      const presignRes = await getUploadUrl(file.name, file.size, file.type)
      const { uploadUrl, attachmentId } = presignRes.result!

      // 2. 开始追踪上传进度
      const task: UploadTask = {
        attachmentId,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
        abortController,
      }
      uploading.value.set(attachmentId, task)

      // 3. PUT 上传到预签名 URL（使用 XMLHttpRequest 追踪进度）
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        abortController.signal.addEventListener('abort', () => {
          xhr.abort()
        })

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const task = uploading.value.get(attachmentId)
            if (task) {
              task.progress = Math.round((e.loaded / e.total) * 100)
            }
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`上传失败: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('网络错误')))
        xhr.addEventListener('abort', () => reject(new Error('已取消')))

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // 4. 更新状态为处理中
      task.status = 'processing'
      task.progress = 100

      // 5. 确认上传
      const confirmRes = await confirmUpload(attachmentId)
      const attachment = confirmRes.result!.attachment

      task.status = 'done'
      uploading.value.delete(attachmentId)

      // 6. 加入对话附件缓存
      const list = conversationAttachments.value.get(conversationId) || []
      list.push(attachment)
      conversationAttachments.value.set(conversationId, list)

      return attachment
    } catch (err: any) {
      const task = uploading.value.get(attachmentId)
      if (task) {
        if (err.message === '已取消') {
          task.status = 'error'
          task.error = '已取消'
        } else {
          task.status = 'error'
          task.error = err.message || '上传失败'
        }
      }
      return null
    }
  }

  /** 批量上传（最多 3 并发） */
  async function uploadFiles(
    conversationId: string,
    files: File[]
  ): Promise<Attachment[]> {
    const results: Attachment[] = []
    const queue = [...files]
    const maxConcurrency = 3

    async function worker() {
      while (queue.length > 0) {
        const file = queue.shift()
        if (file) {
          const result = await useAttachmentStore().uploadFile(conversationId, file)
          if (result) results.push(result)
        }
      }
    }

    const workers = Array.from({ length: Math.min(maxConcurrency, files.length) }, () =>
      worker()
    )
    await Promise.all(workers)

    return results
  }

  /** 取消上传 */
  function cancelUpload(attachmentId: string) {
    const task = uploading.value.get(attachmentId)
    if (task) {
      task.abortController.abort()
    }
  }

  /** 删除附件 */
  async function deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
      await apiDeleteAttachment(attachmentId)

      // 从所有对话缓存中移除
      for (const [convId, attachments] of conversationAttachments.value.entries()) {
        const idx = attachments.findIndex((a) => a.id === attachmentId)
        if (idx !== -1) {
          attachments.splice(idx, 1)
          conversationAttachments.value.set(convId, [...attachments])
          break
        }
      }

      ElMessage.success('附件已删除')
      return true
    } catch {
      ElMessage.error('删除附件失败')
      return false
    }
  }

  /** 加载对话附件列表 */
  async function fetchAttachments(conversationId: string): Promise<Attachment[]> {
    loading.value = true
    try {
      const res = await getConversationAttachments(conversationId)
      const attachments = res.result?.attachments ?? []
      conversationAttachments.value.set(conversationId, attachments)
      return attachments
    } catch {
      ElMessage.error('加载附件列表失败')
      return []
    } finally {
      loading.value = false
    }
  }

  /** 提取文本 */
  async function extractText(attachmentId: string): Promise<string> {
    try {
      const res = await apiExtractText(attachmentId)
      return res.result?.text ?? ''
    } catch {
      ElMessage.error('文本提取失败')
      return ''
    }
  }

  /** 获取对话附件引用（供消息发送使用） */
  function getAttachmentRefs(conversationId: string): AttachmentRef[] {
    const attachments = conversationAttachments.value.get(conversationId) || []
    return attachments
      .filter((a) => a.status === 'ready')
      .map((a) => ({
        id: a.id,
        name: a.fileName,
        type: a.fileType,
        size: a.size,
        url: a.url,
      }))
  }

  return {
    // 状态
    uploading,
    conversationAttachments,
    loading,
    // 计算属性
    uploadingCount,
    uploadTasks,
    // Actions
    uploadFile,
    uploadFiles,
    cancelUpload,
    deleteAttachment,
    fetchAttachments,
    extractText,
    getAttachmentRefs,
  }
})
