import { create } from 'zustand';

interface AppState {
  guestCount: number;
  setGuestCount: (count: number) => void;
  // Add other global states as needed
}

export const useStore = create<AppState>((set) => ({
  guestCount: 0,
  setGuestCount: (count) => set({ guestCount: count }),
}));
