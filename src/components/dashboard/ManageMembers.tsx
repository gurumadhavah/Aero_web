// src/components/dashboard/ManageMembers.tsx
"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { AddTeamMemberForm } from "./AddTeamMemberForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'captain' | 'core' | 'normal';
}

export function ManageMembers() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const sortedUsers = querySnapshot.docs
            .map(doc => doc.data() as UserProfile)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setUsers(sortedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        toast({ title: "Error", description: "Could not fetch the list of members.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (uid: string, role: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role });
      toast({ title: "Role Updated", description: `User role has been changed to ${role}.` });
      fetchUsers(); // Refresh the list to show the change
    } catch (error) {
      toast({ title: "Error", description: "Could not update role.", variant: "destructive" });
    }
  };

  const handleRemoveUser = async (uidToRemove: string, emailToRemove: string) => {
    if (!reason) {
        toast({ title: "Reason required", description: "Please provide a reason for removal.", variant: "destructive"});
        return;
    }
    
    setLoading(true);
    try {
      const functions = getFunctions();
      const removeUserFunction = httpsCallable(functions, 'removeUser');
      const result = await removeUserFunction({ uidToRemove, emailToRemove, reason });
      
      toast({ title: "Success", description: (result.data as any).message });
      fetchUsers(); // Refresh the user list
      setReason(""); // Clear the reason
    } catch (error: any) {
        console.error("Cloud function error:", error);
        toast({ title: "Removal Failed", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Team Member</CardTitle>
          <CardDescription>
            This adds a member to the public team page and pre-approves their email for account registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTeamMemberForm onMemberAdded={fetchUsers} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Registered Members</CardTitle>
           <CardDescription>
            Edit roles or remove members who have already created an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
        {loading ? (
            <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Account Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.uid}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={(value) => handleRoleChange(user.uid, value)} disabled={loading}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="captain">Captain</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <AlertDialog onOpenChange={() => setReason('')}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={loading || user.role === 'captain'}>Remove</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to remove {user.fullName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete their account and send a notification.
                          <Textarea placeholder="Reason for removal..." className="mt-4" value={reason} onChange={(e) => setReason(e.target.value)} />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveUser(user.uid, user.email)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        </CardContent>
      </Card>
    </div>
  );
}