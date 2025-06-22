import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null, // user object or null if not logged in

      setUser: (userData) => set({ user: userData }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        })),

      logout: () => set({ user: null }),
    }),
    {
      name: "user-storage", // localStorage key
    }
  )
);

export default useUserStore;
