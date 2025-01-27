import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { useSource } from '../context/SourceContext';
import { useToast } from "@/hooks/use-toast";

export function CreateSourceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { createSource } = useSource();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createSource(name, description);
      setOpen(false);
      setName('');
      setDescription('');
      toast({
        title: "Success",
        description: "Source created successfully",
      });
    } catch (error) {
      console.error('Failed to create source:', error);
      toast({
        title: "Error",
        description: "Failed to create source",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Source
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter source name"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter source description"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Create Source
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}