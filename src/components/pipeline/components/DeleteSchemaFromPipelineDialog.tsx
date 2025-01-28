import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Schema } from '@/components/schema/types';

interface DeleteSchemaFromPipelineDialogProps {
  schema: Schema;
  onDelete: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSchemaFromPipelineDialog({ 
  schema, 
  onDelete,
  open, 
  onOpenChange 
}: DeleteSchemaFromPipelineDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete();
      toast({
        title: "Success",
        description: "Schema deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete schema:', error);
      toast({
        title: "Error",
        description: "Failed to delete schema",
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
          <DialogTitle>Delete Schema</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{schema.name}" (v{schema.version}) from this pipeline? 
            This will also delete all associated field mappings. This action cannot be undone.
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
              'Delete Schema'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 