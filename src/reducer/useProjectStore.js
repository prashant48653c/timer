import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProjectStore = create(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    {
      name: "active-project-storage", // key in localStorage
    }
  )
);

export default useProjectStore;
