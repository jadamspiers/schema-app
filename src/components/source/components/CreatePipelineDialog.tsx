import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSource } from '../context/SourceContext';
import { supabase } from '@/lib/supabase';
import type { Schema } from '@/components/schema/types';
import { Checkbox } from "@/components/ui/checkbox";

interface CreatePipelineDialogProps {
  sourceId: string;
  existingSchemas: Schema[];
}

export function CreatePipelineDialog({ sourceId, existingSchemas }: CreatePipelineDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);
  const { refreshSources } = useSource();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create new pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert({ name, source_id: sourceId })
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Update selected schemas to use new pipeline
      if (selectedSchemas.length > 0) {
        const { error: updateError } = await supabase
          .from('schemas')
          .update({ pipeline_id: pipeline.id })
          .in('id', selectedSchemas);

        if (updateError) throw updateError;
      }

      await refreshSources();
      setOpen(false);
      setName('');
      setSelectedSchemas([]);
      
      toast({
        title: "Success",
        description: "Pipeline created successfully",
      });
    } catch (error) {
      console.error('Failed to create pipeline:', error);
      toast({
        title: "Error",
        description: "Failed to create pipeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Pipeline
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Pipeline</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pipeline Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pipeline name"
              required
              disabled={loading}
            />
          </div>
          {existingSchemas.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Move Existing Schemas</label>
              <div className="space-y-2">
                {existingSchemas.map(schema => (
                  <div key={schema.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={schema.id}
                      checked={selectedSchemas.includes(schema.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSchemas(prev => 
                          checked 
                            ? [...prev, schema.id]
                            : prev.filter(id => id !== schema.id)
                        );
                      }}
                    />
                    <label htmlFor={schema.id} className="text-sm">
                      {schema.name} (v{schema.version})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            Create Pipeline
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}