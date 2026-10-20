import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Session store — phone-OTP auth (§6.5). Token rides as Bearer on api calls. */
type SessionState = {
  token: string | null;
  phone: string | null;
  setSession: (token: string, phone: string) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      phone: null,
      setSession: (token, phone) => set({ token, phone }),
      signOut: () => set({ token: null, phone: null }),
    }),
    { name: 'calsio-session', storage: createJSONStorage(() => AsyncStorage) }
  )
);
