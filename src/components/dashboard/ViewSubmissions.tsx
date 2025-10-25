"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
// Removed 'limit' import
import { collection, query, onSnapshot, Query, doc, deleteDoc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { format } from 'date-fns';
import { MoreHorizontal, Trash2, Search } from "lucide-react"; // Added Search icon
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
import { Input } from "@/components/ui/input"; // Input is already imported
import { Label } from "@/components/ui/label";

// Interfaces
interface Submission {
  id: string;
  fullName?: string;
  email?: string;
  status?: string;
  submittedAt?: { seconds: number; nanoseconds: number; };
  // Add other potential fields from your recruitment form to search through
  branch?: string;
  yearOfStudy?: string;
  mobileNumber?: string;
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
  // Removed itemLimit prop
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
}: ViewSubmissionsProps) { // Removed itemLimit default
  const [allSubmissions, setAllSubmissions] = React.useState<Submission[]>([]); // Renamed original state
  const [filteredSubmissions, setFilteredSubmissions] = React.useState<Submission[]>([]); // State for filtered results
  const [searchTerm, setSearchTerm] = React.useState(''); // State for search input
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

  // Fetch all submissions initially
  React.useEffect(() => {
    setLoading(true);
    let q: Query = collection(db, collectionName);
    if (orderByField) {
      q = query(q, orderBy(orderByField, "desc"));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setAllSubmissions(data);
      // Initialize filtered list with all data
      setFilteredSubmissions(data);
      setLoading(false);
    }, (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        toast({ title: "Error", description: `Could not load ${collectionName} data.`, variant: "destructive" });
        setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, orderByField, toast]);

  // useEffect to filter submissions when searchTerm changes
  React.useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allSubmissions.filter(submission => {
        // Check multiple fields for the search term
        return (
            submission.fullName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            submission.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
            submission.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
            submission.branch?.toLowerCase().includes(lowerCaseSearchTerm) ||
            submission.yearOfStudy?.toLowerCase().includes(lowerCaseSearchTerm) ||
            submission.mobileNumber?.toLowerCase().includes(lowerCaseSearchTerm)
            // Add any other fields you want to search
        );
    });
    setFilteredSubmissions(filtered);
  }, [searchTerm, allSubmissions]); // Re-run filter when search term or original data changes

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

      let emailDetails = details;
      if (details && details.date) {
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
      // Also remove from the filtered list immediately for better UX
      setFilteredSubmissions(prev => prev.filter(sub => sub.id !== itemToDelete!.id)); // Use non-null assertion
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete submission.", variant: "destructive" });
    } finally {
      setIsAlertOpen(false);
      setItemToDelete(null); // Reset item to delete
    }
  };

  const formatCell = (submission: Submission, header: string) => {
    const value = submission[header];
    if (value === null || value === undefined) return '-';
    if (header.toLowerCase().includes('at') && value?.seconds) {
      return format(new Date(value.seconds * 1000), 'PPP');
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return String(value);
  };

  const hasActions = showActions || showDeleteAction;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  {/* Display count of ALL submissions */}
                  <CardTitle>
                    {title} {collectionName === 'recruitment' && !loading && `(${allSubmissions.length})`}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
              </div>
              {/* Search Input */}
              {collectionName === 'recruitment' && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search name, email, status..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
              )}
          </div>
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
                {/* Use filteredSubmissions */}
                {filteredSubmissions.length > 0 ? filteredSubmissions.map(submission => (
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
                  <TableRow><TableCell colSpan={headers.length + (hasActions ? 1 : 0)} className="h-24 text-center">
                      {searchTerm ? 'No submissions match your search.' : 'No submissions found.'}
                    </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog and Dialog components remain unchanged */}
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