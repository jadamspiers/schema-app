import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JsonAnalyzer from '@/components/JsonAnalyzer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Schema, SchemaField } from '@/components/schema/types';
import { useState } from 'react';

interface CreateSchemaDialogProps {
  pipelineId: string;
  sourceId: string;
  sourceJson?: Record<string, unknown>;
  existingSchemas: Schema[];
  onSchemaCreated: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSchemaDialog({ 
  pipelineId, 
  sourceId,
  sourceJson,
  existingSchemas,
  onSchemaCreated,
  open,
  onOpenChange
}: CreateSchemaDialogProps) {
  const [name, setName] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('source');
  const [fields, setFields] = useState<SchemaField[]>([]);
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('schemas')
        .insert({
          name,
          pipeline_id: pipelineId,
          source_id: sourceId,
          fields,
          version: '1.0.0'
        })
        .select()
        .single();

      if (error) throw error;

      await onSchemaCreated();
      onOpenChange(false);
      setName('');
      setFields([]);
      
      toast({
        title: 'Success',
        description: 'Schema created successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create schema',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Schema</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Schema Name"
          />
          
          {existingSchemas.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              This will be the first schema in the pipeline. It will use the pipeline's source JSON as input.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Source Data</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source">Pipeline Source JSON</SelectItem>
                  {existingSchemas.map(schema => (
                    <SelectItem key={schema.id} value={schema.id}>
                      {schema.name} Output
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <JsonAnalyzer
            onFieldsChange={setFields}
            sourceJson={sourceJson}
            selectedSourceId={selectedSource}
            existingSchemas={existingSchemas}
          />
          
          <Button onClick={handleCreate} className="w-full">
            Create Schema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 