import { create } from 'zustand';

interface LayoutState {
  showFriendRequests: boolean;
  toggleFriendRequests: () => void;
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  showFriendRequests: false,
  toggleFriendRequests: () => set(s => ({ showFriendRequests: !s.showFriendRequests })),
}));
