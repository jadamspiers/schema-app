import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSchema } from '../hooks/useSchema';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Schema } from '../types';

interface DeleteSchemaDialogProps {
  schema: Schema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSchemaDialog({ schema, open, onOpenChange }: DeleteSchemaDialogProps) {
  const [loading, setLoading] = useState(false);
  const { deleteSchema } = useSchema();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteSchema(schema.id);
      toast({
        title: "Success",
        description: "Schema deleted successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to delete schema:', error);
      toast({
        title: "Error",
        description: "Failed to delete schema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Schema</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{schema.name}" (v{schema.version})? This action cannot be undone.
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