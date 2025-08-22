"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed';
  imageUrl: string;
}

export function ViewProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  const fetchProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        // --- THIS IS THE FIX ---
        // It ensures we only try to render items that have a valid imageUrl.
        .filter(item => item.imageUrl && typeof item.imageUrl === 'string');
        
      setProjects(projectsData);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch projects.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      toast({ title: "Success", description: "Project deleted successfully." });
      fetchProjects();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete project.", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const projectRef = doc(db, "projects", editingProject.id);
      await updateDoc(projectRef, {
        title: editingProject.title,
        description: editingProject.description,
        status: editingProject.status,
      });
      toast({ title: "Success", description: "Project updated successfully." });
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      toast({ title: "Error", description: "Could not update project.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Projects</CardTitle>
        <CardDescription>View, edit, or delete ongoing and completed projects.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start">
                <Image src={project.imageUrl} alt={project.title} width={150} height={150} className="rounded-md object-cover" />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{project.title} <span className={`text-sm font-medium ml-2 px-2 py-0.5 rounded-full ${project.status === 'ongoing' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{project.status}</span></h3>
                  <p className="mt-2">{project.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Dialog onOpenChange={(open) => !open && setEditingProject(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
                      {editingProject && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <Input value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} />
                          <Textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} />
                           <Select value={editingProject.status} onValueChange={(value: 'ongoing' | 'completed') => setEditingProject({ ...editingProject, status: value })}>
                               <SelectTrigger><SelectValue /></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="ongoing">Ongoing</SelectItem>
                                   <SelectItem value="completed">Completed</SelectItem>
                               </SelectContent>
                           </Select>
                          <Button type="submit">Save Changes</Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently delete this project.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}