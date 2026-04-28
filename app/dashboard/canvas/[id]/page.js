"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { firestore as db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import CanvasEditor from "@/components/canvas/CanvasEditor";
import { Loader2 } from "lucide-react";

export default function CanvasPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;
      
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check: Only owner can view
          if (data.userId !== user.uid) {
            router.push("/dashboard");
            return;
          }
          setProject({ id: docSnap.id, ...data });
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProject();
      }
    }
  }, [id, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center space-y-4">
           <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
           <p className="text-zinc-500 font-medium animate-pulse">Entering Creative Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
       <CanvasEditor project={project} />
    </main>
  );
}
