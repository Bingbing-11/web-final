import { create } from 'zustand';
import type { FriendStatus } from '../types/user';
import * as api from '../lib/api';

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  toId: string;
  toName: string;
  status: FriendStatus;
  message?: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendUsername: string;
  friendAvatar?: string;
  addedAt: string;
  sharedWorlds: string[];
  /* UI 展示用 */
  hasUpdate?: boolean;
  latestWorldName?: string;
}

interface FriendState {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendRequest: (fromId: string, fromName: string, toId: string, toName: string, message?: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendshipId: string, _currentUserId: string) => Promise<void>;
  getFriends: (userId: string) => Friend[];
  getPendingRequests: (userId: string) => FriendRequest[];
  getSentRequests: (userId: string) => FriendRequest[];
  areFriends: (userId: string, friendId: string) => boolean;
  searchUser: (query: string) => Promise<any | null>;
}

export const useFriendStore = create<FriendState>()((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  isLoading: false,

  fetchFriends: async () => {
    try {
      const res: any = await api.get('/api/friends');
      if (res.code === 200) {
        const data = res.data || [];
        /* 开发阶段：无数据时注入模拟好友 */
        if (data.length === 0) {
          const mock: Friend[] = [
            { id: 'f1', userId: '', friendId: 'u1', friendName: '小星', friendUsername: 'xiaoxing', friendAvatar: '', addedAt: '2025-01-15', sharedWorlds: ['friend-u1-world'], hasUpdate: true, latestWorldName: '雪山' },
            { id: 'f2', userId: '', friendId: 'u2', friendName: '阿月', friendUsername: 'ayue', friendAvatar: '', addedAt: '2025-02-20', sharedWorlds: ['friend-u2-world'], hasUpdate: false, latestWorldName: '月光森林' },
            { id: 'f3', userId: '', friendId: 'u3', friendName: '流云', friendUsername: 'liuyun', friendAvatar: '', addedAt: '2025-03-10', sharedWorlds: ['friend-u3-world'], hasUpdate: true, latestWorldName: '云端漫步' },
            { id: 'f4', userId: '', friendId: 'u4', friendName: '小鹿', friendUsername: 'xiaolu', friendAvatar: '', addedAt: '2025-04-05', sharedWorlds: ['friend-u4-world'], hasUpdate: false, latestWorldName: '鹿鸣谷' },
            { id: 'f5', userId: '', friendId: 'u5', friendName: '木子', friendUsername: 'muzi', friendAvatar: '', addedAt: '2025-04-18', sharedWorlds: ['friend-u5-world'], hasUpdate: false, latestWorldName: '林间小屋' },
            { id: 'f6', userId: '', friendId: 'u6', friendName: '晴天', friendUsername: 'qingtian', friendAvatar: '', addedAt: '2025-05-01', sharedWorlds: ['friend-u6-world'], hasUpdate: true, latestWorldName: '向日葵田' },
          ];
          set({ friends: mock });
          return;
        }
        set({ friends: data });
      }
    } catch {
      // 后端不可用时，注入 mock 好友数据以保证开发预览
      const mock: Friend[] = [
        { id: 'f1', userId: '', friendId: 'u1', friendName: '小星', friendUsername: 'xiaoxing', friendAvatar: '', addedAt: '2025-01-15', sharedWorlds: ['friend-u1-world'], hasUpdate: true, latestWorldName: '雪山' },
        { id: 'f2', userId: '', friendId: 'u2', friendName: '阿月', friendUsername: 'ayue', friendAvatar: '', addedAt: '2025-02-20', sharedWorlds: ['friend-u2-world'], hasUpdate: false, latestWorldName: '月光森林' },
        { id: 'f3', userId: '', friendId: 'u3', friendName: '流云', friendUsername: 'liuyun', friendAvatar: '', addedAt: '2025-03-10', sharedWorlds: ['friend-u3-world'], hasUpdate: true, latestWorldName: '云端漫步' },
        { id: 'f4', userId: '', friendId: 'u4', friendName: '小鹿', friendUsername: 'xiaolu', friendAvatar: '', addedAt: '2025-04-05', sharedWorlds: ['friend-u4-world'], hasUpdate: false, latestWorldName: '鹿鸣谷' },
        { id: 'f5', userId: '', friendId: 'u5', friendName: '木子', friendUsername: 'muzi', friendAvatar: '', addedAt: '2025-04-18', sharedWorlds: ['friend-u5-world'], hasUpdate: false, latestWorldName: '林间小屋' },
        { id: 'f6', userId: '', friendId: 'u6', friendName: '晴天', friendUsername: 'qingtian', friendAvatar: '', addedAt: '2025-05-01', sharedWorlds: ['friend-u6-world'], hasUpdate: true, latestWorldName: '向日葵田' },
      ];
      set({ friends: mock });
    }
  },

  fetchRequests: async () => {
    try {
      const res: any = await api.get('/api/friends/requests');
      if (res.code === 200) {
        set({
          pendingRequests: res.data?.pending || [],
          sentRequests: res.data?.sent || [],
        });
      }
    } catch {
      // 后端不可用时，返回空列表
      set({ pendingRequests: [], sentRequests: [] });
    }
  },

  sendRequest: async (_fromId, _fromName, toId, _toName, message) => {
    try {
      const res: any = await api.post('/api/friends/request', { toId, message });
      if (res.code === 200 || res.code === 201) {
        const req: FriendRequest = {
          id: res.data?.id || '',
          fromId: _fromId,
          fromName: _fromName,
          toId,
          toName: _toName,
          status: 'pending',
          message,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ sentRequests: [...s.sentRequests, req] }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  acceptRequest: async (requestId) => {
    try {
      await api.put(`/api/friends/request/${requestId}/accept`);
      const req = get().pendingRequests.find(r => r.id === requestId);
      set(s => ({
        pendingRequests: s.pendingRequests.filter(r => r.id !== requestId),
        friends: req
          ? [...s.friends, {
              id: '', userId: req.toId, friendId: req.fromId,
              friendName: req.fromName, friendUsername: '', addedAt: new Date().toISOString(), sharedWorlds: [],
            }]
          : s.friends,
      }));
    } catch {
      // Silently fail
    }
  },

  rejectRequest: async (requestId) => {
    try {
      await api.put(`/api/friends/request/${requestId}/reject`);
      set(s => ({ pendingRequests: s.pendingRequests.filter(r => r.id !== requestId) }));
    } catch {
      // Silently fail
    }
  },

  removeFriend: async (friendshipId) => {
    try {
      await api.del(`/api/friends/${friendshipId}`);
      set(s => ({ friends: s.friends.filter(f => f.id !== friendshipId) }));
    } catch {
      // Silently fail
    }
  },

  getFriends: (userId) => get().friends.filter(f => f.userId === userId),
  getPendingRequests: (userId) => get().pendingRequests.filter(r => r.toId === userId),
  getSentRequests: (userId) => get().sentRequests.filter(r => r.fromId === userId),
  areFriends: (userId, friendId) => get().friends.some(
    f => (f.userId === userId && f.friendId === friendId) || (f.userId === friendId && f.friendId === userId)
  ),

  searchUser: async (query: string) => {
    try {
      const res: any = await api.get('/api/users/search', { q: query });
      if (res.code === 200) return res.data;
      return null;
    } catch {
      return null;
    }
  },
}));
