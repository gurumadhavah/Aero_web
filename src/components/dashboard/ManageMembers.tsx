"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { AddTeamMemberForm } from "./AddTeamMemberForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "@/components/ui/badge";

// Combined interface for all members
interface MemberProfile {
  uid?: string;
  email: string;
  fullName: string;
  role: 'captain' | 'core' | 'normal' | 'unregistered';
  registered: boolean;
}

export function ManageMembers() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<MemberProfile[]>([]);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // --- Read environment variable with a fallback ---
  const removeUserFunctionUrl = process.env.NEXT_PUBLIC_REMOVE_USER_FUNCTION_URL;

  const fetchMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const membersSnapshot = await getDocs(collection(db, "members"));
      const allMembersData = membersSnapshot.docs.map(doc => ({ ...doc.data(), email: doc.id })) as { email: string, name: string, registered: boolean }[];

      const usersSnapshot = await getDocs(collection(db, "users"));
      const registeredUsersData = usersSnapshot.docs.map(doc => doc.data() as { uid: string, email: string, fullName: string, role: 'captain' | 'core' | 'normal' });
      
      const combinedMembers = allMembersData.map(member => {
        const registeredUser = registeredUsersData.find(user => user.email === member.email);
        if (registeredUser) {
          return { ...registeredUser, registered: true };
        } else {
          return {
            email: member.email,
            fullName: member.name,
            role: 'unregistered' as const,
            registered: false
          };
        }
      });
      
      const sortedMembers = combinedMembers.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setMembers(sortedMembers);

    } catch (error) {
      console.error("Error fetching members:", error);
      toast({ title: "Error", description: "Could not fetch the member list.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleChange = async (uid: string, role: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role });
      toast({ title: "Role Updated", description: `User role has been changed to ${role}.` });
      fetchMembers();
    } catch (error) {
      toast({ title: "Error", description: "Could not update role.", variant: "destructive" });
    }
  };

  const handleRemoveUser = async (uidToRemove: string | undefined, emailToRemove: string) => {
    if (!reason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason.", variant: "destructive" });
      return;
    }
    
    if (!removeUserFunctionUrl) {
        toast({ title: "Configuration Error", description: "The remove user function URL is not set.", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be logged in.");

      const token = await currentUser.getIdToken();
      
      const response = await fetch(removeUserFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uidToRemove, emailToRemove, reason }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Removal failed.');
      
      toast({ title: "Success", description: result.message });
      fetchMembers();   
      setReason("");
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
            Adds a member to the team and pre-approves their email for registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTeamMemberForm onMemberAdded={fetchMembers} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage All Members</CardTitle>
          <CardDescription>
            View all pre-approved members and manage roles for those who have registered.
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
              <TableHead>Status</TableHead>
              <TableHead>Account Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => (
              <TableRow key={member.email}>
                <TableCell>{member.fullName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {member.registered ? (
                    <Badge variant="default">Registered</Badge>
                  ) : (
                    <Badge variant="secondary">Not Registered</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {member.registered && member.uid ? (
                    <Select value={member.role} onValueChange={(value) => handleRoleChange(member.uid!, value)} disabled={loading}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                        <SelectItem value="captain">Captain</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <AlertDialog onOpenChange={() => setReason('')}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={loading || member.role === 'captain'}>Remove</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to remove {member.fullName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete their account (if registered) and remove them from the members list.
                          <Textarea placeholder="Reason for removal..." className="mt-4" value={reason} onChange={(e) => setReason(e.target.value)} />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveUser(member.uid, member.email)}>Continue</AlertDialogAction>
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