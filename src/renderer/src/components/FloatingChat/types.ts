/** 单条聊天消息 */
export interface ChatMessage {
  id: number
  text: string
  isUser: boolean
  images?: string[]
}

/** 粘贴后待发送的图片项 */
export interface PendingImageItem {
  id: string
  url: string
}

/** Agent 设置（与 FloatingChatAgentConfig 共用） */
export interface AgentSettings {
  systemNotify: boolean
  completionSound: boolean
  autoExpandReply: boolean
}
