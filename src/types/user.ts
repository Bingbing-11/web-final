export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  nightMode: boolean;
  nightModeStart: number;
  nightModeEnd: number;
  language: 'zh-CN' | 'en';
}

export type UserRole = 'owner' | 'editor' | 'viewer';
export type FriendStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
