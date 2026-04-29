import { create } from "zustand";
import { 
  db 
} from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  updateDoc,
  increment 
} from "firebase/firestore";

export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: true,
  error: null,

  // Fetch projects for a specific user
  fetchProjects: (userId) => {
    if (!userId) return;
    set({ loading: true });
    
    const q = query(collection(db, "projects"), where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ projects: projectsList, loading: false });
    }, (error) => {
      set({ error: error.message, loading: false });
    });

    return unsubscribe;
  },

  // Create a new project
  createProject: async (userId, projectData) => {
    try {
      const docRef = await addDoc(collection(db, "projects"), {
        userId,
        name: projectData.name,
        type: projectData.type,
        techStack: projectData.techStack,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isLive: false,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" // Placeholder
      });

      // Update user's project count
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        projectCount: increment(1)
      });

      return docRef.id;
    } catch (error) {
      console.error("Create Project Error:", error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (userId, projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      
      // Update user's project count
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        projectCount: increment(-1)
      });
    } catch (error) {
      console.error("Delete Project Error:", error);
      throw error;
    }
  }
}));
