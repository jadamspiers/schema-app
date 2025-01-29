import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Schema, SchemaField } from '@/components/schema/types';
import { useState, useEffect } from 'react';
import { TransformationEngine } from '@/lib/transformationEngine';
import type { FieldMapping } from '@/components/pipeline/types';
import { Textarea } from "@/components/ui/textarea";
import JsonAnalyzer from '@/components/JsonAnalyzer';

interface CreateSchemaDialogProps {
  pipelineId: string;
  sourceId: string;
  sourceJson: Record<string, unknown>;
  existingSchemas: Schema[];
  onSchemaCreated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mappings: FieldMapping[];
}

export function CreateSchemaDialog({ 
  pipelineId, 
  sourceId,
  sourceJson,
  existingSchemas,
  onSchemaCreated,
  open,
  onOpenChange,
  mappings
}: CreateSchemaDialogProps) {
  const [name, setName] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('source');
  const [previewData, setPreviewData] = useState<Record<string, unknown>>(sourceJson);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSource && selectedSource !== 'source') {
      const schemaIndex = parseInt(selectedSource.replace('schema', '')) - 1;
      const engine = new TransformationEngine(
        existingSchemas.slice(0, schemaIndex + 1),
        mappings,
        sourceJson
      );
      const { intermediateSteps } = engine.transformWithIntermediates();
      setPreviewData(intermediateSteps[schemaIndex] || {});
    } else {
      setPreviewData(sourceJson);
    }
  }, [selectedSource, existingSchemas, sourceJson, mappings]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Schema</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Schema Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <h4 className="mb-2 text-sm font-medium">Select Source Data</h4>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="source">Pipeline Source JSON</SelectItem>
                {existingSchemas.map((schema, index) => (
                  <SelectItem key={schema.id} value={`schema${index + 1}`}>
                    {schema.name} Output
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={JSON.stringify(previewData, null, 2)}
            readOnly
            className="min-h-[200px] font-mono"
            placeholder="JSON preview will appear here..."
          />
          <JsonAnalyzer
            sourceJson={previewData}
            onFieldsChange={setFields}
            hideJsonInput={true}
          />
          <Button onClick={handleCreate} className="w-full">
            Create Schema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 