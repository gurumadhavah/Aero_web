"use client";

import * as React from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface for Achievement Item
interface Achievement {
  id: string;
  title: string;
  date: string;
  rank?: string;
  imageUrl: string;
}

// Interface for the edit form data
interface EditFormData {
    title: string;
    date: string;
    rank: string;
}

export function ViewAchievements() {
  const [items, setItems] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);

  // State for Delete Dialog
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<Achievement | null>(null);

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<Achievement | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({ title: "", date: "", rank: "" });
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch achievements from Firestore on component mount
  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "achievements"), orderBy("sortId", "asc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
        setItems(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Opens the delete confirmation dialog
  const handleDeleteClick = (item: Achievement) => {
    setItemToDelete(item);
    setIsAlertOpen(true);
  };

  // Deletes the item from Firestore and updates the UI
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "achievements", itemToDelete.id));
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setItemToDelete(null);
      setIsAlertOpen(false);
    }
  };

  // Opens the edit dialog and populates it with item data
  const handleEditClick = (item: Achievement) => {
    setItemToEdit(item);
    setEditFormData({ title: item.title, date: item.date, rank: item.rank || "" });
    setIsEditDialogOpen(true);
  };

  // Handles changes in the edit form inputs
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles the form submission to update the achievement
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    setIsUpdating(true);
    const itemRef = doc(db, "achievements", itemToEdit.id);

    try {
      await updateDoc(itemRef, {
        ...editFormData,
      });
      
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemToEdit.id ? { ...item, ...editFormData } : item
        )
      );

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
          <CardTitle>Existing Achievements</CardTitle>
          <CardDescription>A list of all recorded club achievements.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rank/Award</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image src={item.imageUrl} alt={item.title} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.rank || '-'}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-600 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No achievements found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the achievement titled "<b>{itemToDelete?.title}</b>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
            <DialogDescription>
              Make changes to your achievement here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form id="edit-achievement-form" onSubmit={handleUpdateItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={editFormData.title} onChange={handleFormChange} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="date" value={editFormData.date} onChange={handleFormChange} className="col-span-3" required/>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rank" className="text-right">Rank/Award</Label>
                <Input id="rank" name="rank" value={editFormData.rank} onChange={handleFormChange} className="col-span-3" placeholder="e.g., 1st Place (Optional)"/>
              </div>
            </div>
          </form>
           <DialogFooter>
              <Button type="submit" form="edit-achievement-form" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}