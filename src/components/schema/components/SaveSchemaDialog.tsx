import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchema } from '../hooks/useSchema';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { TemplateField } from '@/components/JsonAnalyzer/components/types';
import type { Schema } from '../types';

interface SaveSchemaDialogProps {
  fields: TemplateField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exampleJson?: string;
  initialSchema?: Schema;
}

export function SaveSchemaDialog({ 
  fields, 
  open, 
  onOpenChange, 
  exampleJson, 
  initialSchema 
}: SaveSchemaDialogProps) {
  const [name, setName] = useState(initialSchema?.name || '');
  const [version, setVersion] = useState(initialSchema?.version || '0.0.1');
  const [loading, setLoading] = useState(false);
  const { sourceId } = useParams();
  const { createSchema, updateSchema } = useSchema();
  const { toast } = useToast();

  const incrementPatchVersion = (currentVersion: string) => {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) return;

    try {
      setLoading(true);
      const schemaData = {
        name,
        source_id: sourceId,
        fields: fields.map(({ id, key, path }) => ({
          id,
          key,
          path,
          value: path // Use path as value
        })),
        example_json: exampleJson,
        version: initialSchema ? incrementPatchVersion(initialSchema.version) : version
      };
      console.log('Saving schema with data:', schemaData);

      if (initialSchema) {
        await updateSchema(initialSchema.id, schemaData);
        toast({
          title: "Success",
          description: "Schema updated successfully",
        });
      } else {
        await createSchema(schemaData);
        toast({
          title: "Success",
          description: "Schema saved successfully",
        });
      }
      onOpenChange(false);
      if (!initialSchema) {
        setName(''); 
        setVersion('0.0.1');
      }
    } catch (error) {
      console.error('Failed to save schema:', error);
      toast({
        title: "Error",
        description: initialSchema ? "Failed to update schema" : "Failed to save schema",
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
          <DialogTitle>
            {initialSchema ? `Update Schema (v${initialSchema.version})` : 'Save Schema'}
          </DialogTitle>
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
          {!initialSchema && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="x.x.x"
                pattern="\d+\.\d+\.\d+"
                title="Version must be in x.x.x format"
                required
                disabled={loading}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialSchema ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              initialSchema ? `Update Schema to v${incrementPatchVersion(initialSchema.version)}` : 'Save Schema'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}