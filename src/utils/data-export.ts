/**
 * 数据导出工具
 *
 * 将 AppData 导出为 JSON 字符串，并支持触发浏览器下载。
 */

import type { AppData } from '@/types';

// ============================================================================
// 导出 JSON
// ============================================================================

/**
 * 将 AppData 序列化为 JSON 字符串。
 *
 * @param appData - 要导出的应用数据
 * @param includeApiKeys - 是否包含 API 密钥，默认 false
 * @returns 格式化的 JSON 字符串（2 空格缩进）
 */
export function exportToJson(
  appData: AppData,
  includeApiKeys: boolean = false,
): string {
  let dataToExport = appData;

  // 如果不包含 API 密钥，深拷贝后移除
  if (!includeApiKeys) {
    dataToExport = structuredClone(appData);
    for (const provider of dataToExport.providers) {
      delete provider.apiKey;
    }
  }

  return JSON.stringify(dataToExport, null, 2);
}

// ============================================================================
// 浏览器下载
// ============================================================================

/**
 * 触发浏览器下载 JSON 文件。
 *
 * 通过创建临时 Blob 和隐藏的 <a> 标签实现下载。
 *
 * @param json - JSON 字符串
 * @param filename - 下载文件名
 */
export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  // 清理：稍后释放 Blob URL
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

// ============================================================================
// 文件名生成
// ============================================================================

/**
 * 生成导出文件名。
 *
 * 格式：cherry-studio-web-YYYYMMDD-HHmmss.json
 *
 * @returns 带时间戳的文件名
 */
export function generateExportFilename(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');

  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  return `cherry-studio-web-${datePart}-${timePart}.json`;
}
