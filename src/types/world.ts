export interface World {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  icon?: string;
  color: string;
  imageUrl?: string;
  isSealed: boolean;
  sealedAt?: string;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
  permissions: WorldPermission[];
  /* 设计稿新增字段 */
  unreadCount?: number;
  latestExcerpt?: string;
  imageUrl?: string;
}

export interface WorldPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string;
}
