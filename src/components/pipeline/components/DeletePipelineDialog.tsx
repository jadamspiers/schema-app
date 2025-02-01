import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Pipeline } from '@/components/source/types';

interface DeletePipelineDialogProps {
  pipeline: Pipeline;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePipelineDialog({ pipeline, open, onOpenChange }: DeletePipelineDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // Delete pipeline and all associated data
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', pipeline.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pipeline deleted successfully",
      });
      
      // Navigate back to source page
      navigate(`/source/${pipeline.source_id}`);
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
      toast({
        title: "Error",
        description: "Failed to delete pipeline",
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
          <DialogTitle>Delete Pipeline</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{pipeline.name}" (v{pipeline.version})? 
            This will also delete all associated schemas and field mappings. This action cannot be undone.
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
              'Delete Pipeline'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 