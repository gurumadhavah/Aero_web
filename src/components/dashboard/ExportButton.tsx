"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { json2csv } from "json-2-csv";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface ExportButtonProps {
  collectionName: string;
  fileName: string;
  orderByField?: string;
}

export function ExportButton({ collectionName, fileName, orderByField = "submittedAt" }: ExportButtonProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    toast({ title: "Exporting...", description: "Fetching data to export." });
    try {
      const q = query(collection(db, collectionName), orderBy(orderByField, "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      if (data.length === 0) {
        toast({ title: "No Data", description: "There is no data to export.", variant: "destructive" });
        return;
      }

      const csv = await json2csv(data);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export Successful!", description: `${fileName}.csv has been downloaded.` });

    } catch (error) {
      console.error(`Error exporting ${collectionName}:`, error);
      toast({ title: "Export Failed", description: "Could not export the data. Please check console for missing index.", variant: "destructive" });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export as Excel (CSV)
    </Button>
  );
}