import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSource } from '../context/SourceContext';
import { useState } from 'react';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteSourceDialogProps {
  sourceId: string;
  sourceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSourceDialog({ sourceId, sourceName, open, onOpenChange }: DeleteSourceDialogProps) {
  const [loading, setLoading] = useState(false);
  const { deleteSource } = useSource();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteSource(sourceId);
      toast({
        title: "Success",
        description: "Source deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete source:', error);
      toast({
        title: "Error",
        description: "Failed to delete source",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Source</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{sourceName}"? This will also delete all associated pipelines and schemas. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Source'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 