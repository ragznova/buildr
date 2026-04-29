import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  auth, 
  db 
} from "@/lib/firebase/config";
import { 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      loading: true,
      error: null,

      setUser: (user) => set({ user }),
      setUserData: (userData) => set({ userData }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Initialize listener
      init: () => {
        set({ loading: true });
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            set({ user });
            // Fetch additional user data from Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              set({ userData: docSnap.data() });
            } else {
              // This is a new user (likely from Google Auth)
              const newData = {
                uid: user.uid,
                name: user.displayName || "User",
                email: user.email,
                plan: "free",
                projectCount: 0,
                storageUsed: 0,
                createdAt: serverTimestamp(),
                watermarkCount: 0
              };
              await setDoc(docRef, newData);
              set({ userData: newData });
            }
          } else {
            set({ user: null, userData: null });
          }
          set({ loading: false });
        });
        return unsubscribe;
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, userData: null });
        } catch (error) {
          console.error("Logout Error:", error);
        }
      }
    }),
    {
      name: "buildr-auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user, userData: state.userData }),
    }
  )
);
