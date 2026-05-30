export interface World {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  icon?: string;
  color: string;
  isSealed: boolean;
  sealedAt?: string;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
  permissions: WorldPermission[];
}

export interface WorldPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string;
}
