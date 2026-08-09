// ─── Settings Type Extension ──────────────────────────────────────────────────
// Extends the base Settings interface with additional UI/UX fields.
// This file supplements types/index.ts without modifying it.

import type { Settings } from './index'

export interface ExtendedSettings extends Settings {
  messageStyle?: 'bubble' | 'plain'
  showMessageDivider?: boolean
  codeShowLineNumbers?: boolean
  codeWrappable?: boolean
  showInputEstimatedTokens?: boolean
}

export type ModalTypeExtended = '' | 'command' | 'model' | 'prompt' | 'settings' | 'provider' | 'assistant'
