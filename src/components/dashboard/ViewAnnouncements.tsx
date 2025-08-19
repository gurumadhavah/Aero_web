// src/components/dashboard/ViewAnnouncements.tsx
"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format } from 'date-fns';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Interface for Announcement Item
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number; };
}

// Interface for the edit form data
interface EditFormData {
    title: string;
    content: string;
}

export function ViewAnnouncements() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);

  // State for Delete Dialog
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<Announcement | null>(null);

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<Announcement | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({ title: "", content: "" });
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDeleteClick = (item: Announcement) => {
    setItemToDelete(item);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "announcements", itemToDelete.id));
      setAnnouncements(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
    } finally {
      setItemToDelete(null);
      setIsAlertOpen(false);
    }
  };

  const handleEditClick = (item: Announcement) => {
    setItemToEdit(item);
    setEditFormData({ title: item.title, content: item.content });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    setIsUpdating(true);
    const itemRef = doc(db, "announcements", itemToEdit.id);

    try {
      await updateDoc(itemRef, { ...editFormData });
      setAnnouncements(prev => prev.map(item => item.id === itemToEdit.id ? { ...item, ...editFormData } : item));
      setIsEditDialogOpen(false);
      setItemToEdit(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Posted Announcements</CardTitle>
          <CardDescription>View, edit, or delete past announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-12 w-full" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.length > 0 ? announcements.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-sm truncate">{item.content}</TableCell>
                    <TableCell>{item.createdAt ? format(new Date(item.createdAt.seconds * 1000), 'PPP') : '-'}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(item)}><Pencil className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-600 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No announcements found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the announcement titled "<b>{itemToDelete?.title}</b>". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Make changes to your announcement here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <form id="edit-announcement-form" onSubmit={handleUpdateItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={editFormData.title} onChange={handleFormChange} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">Content</Label>
                <Textarea id="content" name="content" value={editFormData.content} onChange={handleFormChange} className="col-span-3" rows={5} required/>
              </div>
            </div>
          </form>
           <DialogFooter>
              <Button type="submit" form="edit-announcement-form" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}