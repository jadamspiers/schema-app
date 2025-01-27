import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchema } from '../hooks/useSchema';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { TemplateField } from '@/components/JsonAnalyzer/components/types';
import { useSource } from '@/components/source/context/SourceContext';
import type { Schema } from '../types';

interface SaveSchemaDialogProps {
  fields: TemplateField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exampleJson?: string;
  initialSchema?: Schema;
  isModified?: boolean;
}

export function SaveSchemaDialog({ 
  fields, 
  open, 
  onOpenChange, 
  exampleJson, 
  initialSchema,
  isModified
}: SaveSchemaDialogProps) {
  const [name, setName] = useState(initialSchema?.name || '');
  const [version, setVersion] = useState('');
  const [customVersion, setCustomVersion] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sourceId } = useParams();
  const { sources } = useSource();
  const { createSchema, updateSchema } = useSchema();
  const { toast } = useToast();

  const source = sources.find(s => s.id === sourceId);
  const defaultPipeline = source?.pipelines?.[0];

  const incrementPatchVersion = (currentVersion: string) => {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  };

  const nextVersion = initialSchema ? incrementPatchVersion(initialSchema.version) : '0.0.1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !defaultPipeline) return;

    try {
      setLoading(true);
      const schemaData = {
        name,
        pipeline_id: defaultPipeline.id,
        source_id: sourceId,
        fields: fields.map(({ id, key, path }) => ({
          id,
          key,
          path,
          value: path
        })),
        example_json: exampleJson,
        version: customVersion ? version : nextVersion
      };

      if (initialSchema) {
        await updateSchema(initialSchema.id, schemaData);
        toast({
          title: "Success",
          description: `Schema updated to v${schemaData.version}`,
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
            {initialSchema 
              ? `Update Schema (Current: v${initialSchema.version})` 
              : 'Save Schema'}
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
          {initialSchema && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Version</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomVersion(!customVersion)}
                >
                  {customVersion ? "Use automatic version" : "Customize version"}
                </Button>
              </div>
              {customVersion ? (
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="x.x.x"
                  pattern="\d+\.\d+\.\d+"
                  title="Version must be in x.x.x format"
                  required
                  disabled={loading}
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Will be updated to v{nextVersion}
                </div>
              )}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (!isModified && !!initialSchema)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialSchema ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              initialSchema 
                ? `Update to v${customVersion ? version : nextVersion}` 
                : 'Save Schema'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}