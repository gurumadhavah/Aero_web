"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, query, limit, onSnapshot, Query, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { MoreHorizontal, Trash2 } from "lucide-react";
import emailjs from "emailjs-com";
import { getRecruitmentEmailBody, getRecruitmentEmailSubject } from "@/lib/emailTemplates";

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interfaces
interface Submission {
  id: string;
  fullName?: string;
  email?: string;
  status?: string;
  submittedAt?: { seconds: number; nanoseconds: number; };
  [key: string]: any;
}

interface ViewSubmissionsProps {
  collectionName: string;
  title: string;
  description: string;
  headers: string[];
  showActions?: boolean;
  showDeleteAction?: boolean;
  orderByField?: string;
  itemLimit?: number;
}

const formatHeader = (header: string) => {
  const result = header.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export function ViewSubmissions({
  collectionName,
  title,
  description,
  headers,
  showActions = false,
  showDeleteAction = false,
  orderByField,
  itemLimit = 20,
}: ViewSubmissionsProps) {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<Submission | null>(null);
  const { toast } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteModalType, setInviteModalType] = React.useState<'test' | 'interview' | null>(null);
  const [applicantToInvite, setApplicantToInvite] = React.useState<Submission | null>(null);
  const [inviteDate, setInviteDate] = React.useState('');
  const [inviteVenue, setInviteVenue] = React.useState('');

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const genericTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  React.useEffect(() => {
    setLoading(true);
    const q: Query = query(collection(db, collectionName), limit(itemLimit));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      if (orderByField) {
        data.sort((a, b) => {
          const aTimestamp = a[orderByField];
          const bTimestamp = b[orderByField];
          if (aTimestamp && bTimestamp) return bTimestamp.seconds - aTimestamp.seconds;
          return 0;
        });
      }
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, orderByField, itemLimit]);

  const handleInviteModal = (applicant: Submission, type: 'test' | 'interview') => {
    setApplicantToInvite(applicant);
    setInviteModalType(type);
    setIsInviteModalOpen(true);
    setInviteDate('');
    setInviteVenue('');
  };

  const handleSendInvite = async () => {
    if (!applicantToInvite || !inviteDate || !inviteVenue) {
      toast({ title: "Error", description: "Date and Venue are required.", variant: "destructive" });
      return;
    }
    const action = inviteModalType === 'test' ? 'invite_test' : 'interview';
    await handleProcessApplication(applicantToInvite, action, { date: inviteDate, venue: inviteVenue });
    setIsInviteModalOpen(false);
  };

  const handleProcessApplication = async (applicant: Submission, action: string, details?: { date: string, venue: string }) => {
    if (!applicant?.email || !applicant?.fullName) {
        toast({ title: "Error", description: "Applicant data is missing.", variant: "destructive" });
        return;
    }
    setActionLoading(applicant.id);
    try {
      const docRef = doc(db, collectionName, applicant.id);
      let newStatus = action.replace('invite_', '');
      if (action.includes('invite')) newStatus += '_invited';
      await updateDoc(docRef, { status: newStatus, lastUpdated: serverTimestamp() });

      // --- FIX & IMPROVEMENT IS HERE ---
      // Create a new details object for the email to format the date nicely.
      let emailDetails = details;
      if (details && details.date) {
        // The input type="date" gives "YYYY-MM-DD". We add 'T00:00:00' to avoid timezone issues
        // and then format it into a readable string like "October 17, 2025".
        const formattedDate = format(new Date(details.date + 'T00:00:00'), 'MMMM d, yyyy');
        emailDetails = { ...details, date: formattedDate };
      }

      const templateParams = {
        subject: getRecruitmentEmailSubject(action),
        html_body: getRecruitmentEmailBody(action, applicant.fullName, emailDetails),
        to_email: applicant.email,
      };

      await emailjs.send(serviceId, genericTemplateId, templateParams, publicKey);
      
      toast({ title: "Action Success", description: `Application for ${applicant.fullName} processed.` });
    } catch (error: any) {
      console.error("Error processing application:", error);
      toast({ title: "Action Failed", description: `An error occurred: ${error.text || "Check console."}`, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (submission: Submission) => {
    setItemToDelete(submission);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, collectionName, itemToDelete.id));
      toast({ title: "Success", description: "Submission has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete submission.", variant: "destructive" });
    } finally {
      setIsAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const formatCell = (submission: Submission, header: string) => {
    const value = submission[header];
    if (!value) return '-';
    if (header.toLowerCase().includes('at') && value?.seconds) {
      return format(new Date(value.seconds * 1000), 'PPP');
    }
    return String(value);
  };

  const hasActions = showActions || showDeleteAction;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" /> <Skeleton className="h-8 w-full" /> <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map(header => <TableHead key={header}>{formatHeader(header)}</TableHead>)}
                  {hasActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? submissions.map(submission => (
                  <TableRow key={submission.id}>
                    {headers.map(header => <TableCell key={header}>{formatCell(submission, header)}</TableCell>)}
                    {hasActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionLoading === submission.id}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {collectionName === 'recruitment' && (
                              <>
                                <DropdownMenuItem onClick={() => handleInviteModal(submission, 'test')}>Invite for Test</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleInviteModal(submission, 'interview')}>Invite for Interview</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleProcessApplication(submission, 'accept')}>Confirm Membership</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-500" onClick={() => handleProcessApplication(submission, 'reject')}>Reject Application</DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {showDeleteAction && (
                              <DropdownMenuItem className="text-red-600 focus:text-red-500" onClick={() => handleDeleteClick(submission)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={headers.length + (hasActions ? 1 : 0)} className="h-24 text-center">No submissions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the submission for "{itemToDelete?.fullName}". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite for {inviteModalType}</DialogTitle>
            <DialogDescription>Enter the date and venue for the applicant's {inviteModalType}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-date" className="text-right">Date</Label>
              <Input id="invite-date" type="date" value={inviteDate} onChange={(e) => setInviteDate(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-venue" className="text-right">Venue</Label>
              <Input id="invite-venue" type="text" value={inviteVenue} onChange={(e) => setInviteVenue(e.target.value)} className="col-span-3" placeholder="e.g., Aero Lab, B-Block" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}