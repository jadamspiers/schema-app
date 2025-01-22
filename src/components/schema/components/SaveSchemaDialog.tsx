import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchema } from '../hooks/useSchema';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { TemplateField } from '@/components/JsonAnalyzer/components/types';

interface SaveSchemaDialogProps {
  fields: TemplateField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveSchemaDialog({ fields, open, onOpenChange }: SaveSchemaDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { sourceId } = useParams();
  const { createSchema } = useSchema();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) return;

    try {
      setLoading(true);
      await createSchema({
        name,
        source_id: sourceId,
        fields
      });
      toast({
        title: "Success",
        description: "Schema saved successfully",
      });
      onOpenChange(false);
      setName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schema",
        variant: "destructive",
      });
      console.error('Failed to save schema:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Schema</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Schema Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter schema name"
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schema'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}