"use client";

import * as React from "react";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { collection, query, limit, onSnapshot, Query, doc, deleteDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { MoreHorizontal, Trash2 } from "lucide-react";

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Submission {
  id: string;
  name?: string;
  fullName?: string;
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
    itemLimit = 20
}: ViewSubmissionsProps) {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<Submission | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setLoading(true);
    const q: Query = query(collection(db, collectionName), limit(itemLimit));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));

      if (orderByField) {
        data.sort((a, b) => {
          const aTimestamp = a[orderByField];
          const bTimestamp = b[orderByField];
          const aHasDate = aTimestamp && typeof aTimestamp.seconds === 'number';
          const bHasDate = bTimestamp && typeof bTimestamp.seconds === 'number';

          if (aHasDate && !bHasDate) return -1;
          if (!aHasDate && bHasDate) return 1;
          if (!aHasDate && !bHasDate) return 0;
          
          return bTimestamp.seconds - aTimestamp.seconds;
        });
      }
      setSubmissions(data);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, orderByField, itemLimit]);

  const handleProcessApplication = async (applicant: Submission, approved: boolean) => {
    setActionLoading(applicant.id);
    try {
      const processRecruitment = httpsCallable(functions, 'processRecruitment');
      await processRecruitment({
        applicantEmail: applicant.email,
        applicantName: applicant.fullName,
        approved: approved,
        docId: applicant.id,
      });

      toast({
        title: `Applicant ${approved ? 'Approved' : 'Rejected'}`,
        description: `${applicant.fullName}'s application has been processed.`,
      });
    } catch (error) {
      console.error("Error processing application:", error);
      toast({ title: "Action Failed", description: "An error occurred. Please check the console.", variant: "destructive" });
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
      console.error("Error deleting submission:", error);
      toast({ title: "Error", description: "Failed to delete submission.", variant: "destructive" });
    } finally {
      setIsAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const formatCell = (submission: Submission, header: string) => {
    const value = submission[header];
    if (!value) return '-';

    // THE FIX: Added a check for the header name 'timestamp'
    const isDateField = header.toLowerCase().includes('at') || header.toLowerCase() === 'timestamp';

    if (isDateField && value && typeof value.seconds === 'number') {
      return format(new Date(value.seconds * 1000), 'PPP');
    }
    return value.toString();
  }

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
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
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
                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {showActions && (
                              <>
                                <DropdownMenuItem onClick={() => handleProcessApplication(submission, true)}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleProcessApplication(submission, false)}>Reject</DropdownMenuItem>
                              </>
                            )}
                            {showDeleteAction && (
                              <>
                                {showActions && <DropdownMenuSeparator />}
                                <DropdownMenuItem className="text-red-600 focus:text-red-500" onClick={() => handleDeleteClick(submission)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </>
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
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the submission from "{itemToDelete?.name || itemToDelete?.fullName}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}