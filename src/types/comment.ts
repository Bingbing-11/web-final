/**
 * 留言/评论类型
 */

export interface Comment {
  id: string;
  /** 关联的日记 ID */
  entryId: string;
  /** 留言者 ID */
  userId: string;
  /** 留言者昵称 */
  userName: string;
  /** 留言者头像（emoji 或 URL） */
  userAvatar: string;
  /** 留言内容 */
  content: string;
  /** 是否为回复（非顶级评论） */
  replyToId?: string;
  /** 回复目标用户名 */
  replyToName?: string;
  /** 创建时间 */
  createdAt: string;
}
