// src/components/dashboard/ViewDocuments.tsx
"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';

interface Document {
  id: string;
  documentName: string;
  description: string;
  fileName: string;
  fileUrl: string;
  uploaderName: string;
  createdAt: { seconds: number; nanoseconds: number; };
}

export function ViewDocuments() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Log</CardTitle>
        <CardDescription>View and download shared club documents.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.documentName}</TableCell>
                  <TableCell>{doc.description || '-'}</TableCell>
                  <TableCell>{doc.uploaderName}</TableCell>
                  <TableCell>{doc.createdAt ? format(new Date(doc.createdAt.seconds * 1000), 'PPP') : '-'}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}