import { Schema, SchemaField } from '@/components/schema/types';
import { Card } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';
import { FieldMapping } from '../types';
import { SchemaConnection } from './SchemaConnection';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { PipelinePreview } from './PipelinePreview';
import { SourceJsonEditor } from './SourceJsonEditor';
import { Button } from "@/components/ui/button";
import { CreateSchemaDialog } from './CreateSchemaDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JsonAnalyzer from "@/components/JsonAnalyzer";
import { DeleteSchemaFromPipelineDialog } from './DeleteSchemaFromPipelineDialog';

interface PipelineEditorProps {
  schemas: Schema[];
  pipelineId: string;
  onOrderChange?: (schemaIds: string[]) => void;
  sourceData?: Record<string, unknown>;
  onSourceJsonChange?: (json: Record<string, unknown>) => void;
  sourceId: string;
}

export function PipelineEditor({ 
  schemas, 
  pipelineId, 
  onOrderChange,
  sourceData = {},
  onSourceJsonChange = () => {},
  sourceId
}: PipelineEditorProps) {
  const [localSchemas, setLocalSchemas] = useState(schemas);
  const [selectedField, setSelectedField] = useState<{
    schemaId: string;
    field: SchemaField;
  } | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [draggingSchema, setDraggingSchema] = useState<string | null>(null);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toast } = useToast();
  const [createSchemaOpen, setCreateSchemaOpen] = useState(false);
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [schemaToDelete, setSchemaToDelete] = useState<Schema | null>(null);

  useEffect(() => {
    setLocalSchemas(schemas);
  }, [schemas]);

  useEffect(() => {
    // Load existing mappings
    const loadMappings = async () => {
      const { data, error } = await supabase
        .from('field_mappings')
        .select('*')
        .eq('pipeline_id', pipelineId);
        
      if (error) {
        toast({
          title: 'Error loading mappings',
          description: 'Failed to load field mappings',
          variant: 'destructive',
        });
        return;
      }
      
      setMappings(data.map(m => ({
        sourceSchemaId: m.source_schema_id,
        sourceFieldId: m.source_field_id,
        targetSchemaId: m.target_schema_id,
        targetFieldId: m.target_field_id,
        sourceType: m.source_type || 'schema',
        sourceReference: m.source_reference || m.source_field_id,
        transformation: m.transformation_type ? {
          type: m.transformation_type,
          options: m.transformation_options
        } : undefined
      })));
    };

    loadMappings();
  }, [pipelineId, toast]);

  const handleDragStart = (e: React.DragEvent, schemaId: string) => {
    setDraggingSchema(schemaId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetSchemaId: string) => {
    e.preventDefault();
    if (!draggingSchema || draggingSchema === targetSchemaId) return;

    try {
      // Get current pipeline version
      const { data: pipeline, error: fetchError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (fetchError) throw fetchError;

      // Create new version
      const [major, minor, patch] = pipeline.version.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}`;

      const newOrder = localSchemas.map(s => s.id);
      const fromIndex = newOrder.indexOf(draggingSchema);
      const toIndex = newOrder.indexOf(targetSchemaId);

      const reorderedSchemas = [...localSchemas];
      const [movedSchema] = reorderedSchemas.splice(fromIndex, 1);
      reorderedSchemas.splice(toIndex, 0, movedSchema);

      // Create new pipeline version
      const { data: newPipelineData, error: insertError } = await supabase
        .from('pipelines')
        .insert({
          ...pipeline,
          version: newVersion,
          is_latest: true,
          schema_order: reorderedSchemas.map(s => s.id)
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Copy existing mappings to new pipeline version
      const { error: mappingsError } = await supabase
        .from('field_mappings')
        .insert(
          mappings.map(m => ({
            pipeline_id: newPipelineData.id,
            source_schema_id: m.sourceSchemaId,
            source_field_id: m.sourceFieldId,
            target_schema_id: m.targetSchemaId,
            target_field_id: m.targetFieldId,
            transformation_type: m.transformation?.type ?? 'none',
            transformation_options: m.transformation?.options ?? {}
          }))
        );

      if (mappingsError) throw mappingsError;

      setLocalSchemas(reorderedSchemas);
      onOrderChange?.(reorderedSchemas.map(s => s.id));
      setDraggingSchema(null);
      toast({
        title: 'Success',
        description: `Pipeline updated to version ${newVersion}`,
      });
    } catch (error) {
      toast({
        title: 'Error updating schema order',
        description: error instanceof Error ? error.message : 'Failed to update schema order',
        variant: 'destructive',
      });
    }
  };

  const handleFieldClick = async (schemaId: string, field: SchemaField) => {
    if (!selectedField) {
      setSelectedField({ schemaId, field });
    } else if (selectedField.schemaId !== schemaId) {
      const isFirstSchema = localSchemas[0].id === schemaId;
      const newMapping: FieldMapping = {
        sourceSchemaId: selectedField.schemaId,
        sourceFieldId: selectedField.field.id,
        targetSchemaId: schemaId,
        targetFieldId: field.id,
        sourceType: isFirstSchema ? 'json' : 'schema',
        sourceReference: isFirstSchema ? selectedField.field.path : selectedField.field.id,
        transformation: {
          type: 'none',
          options: {}
        }
      };

      if (!isFirstSchema && wouldCreateCycle(newMapping)) {
        toast({
          title: 'Invalid Mapping',
          description: 'This mapping would create a circular dependency',
          variant: 'destructive',
        });
        setSelectedField(null);
        return;
      }

      try {
        // First, get current pipeline version
        const { data: pipeline, error: fetchError } = await supabase
          .from('pipelines')
          .select('version')
          .eq('id', pipelineId)
          .single();

        if (fetchError) throw fetchError;

        // Create new version
        const [major, minor, patch] = pipeline.version.split('.').map(Number);
        const newVersion = `${major}.${minor}.${patch + 1}`;

        // Create new pipeline version
        const { data: newPipelineData, error: insertError } = await supabase
          .from('pipelines')
          .insert({
            ...pipeline,
            version: newVersion,
            is_latest: true
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Add mapping to new pipeline version
        const { error: mappingError } = await supabase
          .from('field_mappings')
          .insert({
            pipeline_id: newPipelineData.id,
            source_schema_id: newMapping.sourceSchemaId,
            source_field_id: newMapping.sourceFieldId,
            target_schema_id: newMapping.targetSchemaId,
            target_field_id: newMapping.targetFieldId,
            transformation_type: newMapping.transformation!.type,
            transformation_options: newMapping.transformation!.options
          });

        if (mappingError) throw mappingError;
        
        setMappings([...mappings, newMapping]);
        setSelectedField(null);
        toast({
          title: 'Success',
          description: `Pipeline updated to version ${newVersion}`,
        });
      } catch (error) {
        toast({
          title: 'Error creating mapping',
          description: error instanceof Error ? error.message : 'Failed to create field mapping',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteMapping = async (mapping: FieldMapping) => {
    try {
      // Get current pipeline version
      const { data: pipeline, error: fetchError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (fetchError) throw fetchError;

      // Create new version
      const [major, minor, patch] = pipeline.version.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}`;

      // Create new pipeline version
      const { data: newPipelineData, error: insertError } = await supabase
        .from('pipelines')
        .insert({
          ...pipeline,
          version: newVersion,
          is_latest: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Delete mapping from new pipeline version
      const { error: deleteError } = await supabase
        .from('field_mappings')
        .delete()
        .match({
          pipeline_id: newPipelineData.id,
          source_schema_id: mapping.sourceSchemaId,
          source_field_id: mapping.sourceFieldId,
          target_schema_id: mapping.targetSchemaId,
          target_field_id: mapping.targetFieldId
        });

      if (deleteError) throw deleteError;
      
      setMappings(mappings.filter(m => 
        !(m.sourceSchemaId === mapping.sourceSchemaId && 
          m.sourceFieldId === mapping.sourceFieldId &&
          m.targetSchemaId === mapping.targetSchemaId &&
          m.targetFieldId === mapping.targetFieldId)
      ));

      toast({
        title: 'Success',
        description: `Pipeline updated to version ${newVersion}`,
      });
    } catch (error) {
      toast({
        title: 'Error deleting mapping',
        description: error instanceof Error ? error.message : 'Failed to delete field mapping',
        variant: 'destructive',
      });
    }
  };

  const getFieldRef = (schemaId: string, fieldId: string) => {
    return fieldRefs.current.get(`${schemaId}-${fieldId}`) || null;
  };

  const wouldCreateCycle = (newMapping: FieldMapping) => {
    // Create a graph of schema dependencies
    const graph = new Map<string, Set<string>>();
    
    // Initialize graph with existing mappings
    for (const mapping of mappings) {
      if (!graph.has(mapping.sourceSchemaId)) {
        graph.set(mapping.sourceSchemaId, new Set());
      }
      graph.get(mapping.sourceSchemaId)?.add(mapping.targetSchemaId);
    }
    
    // Add the new mapping
    if (!graph.has(newMapping.sourceSchemaId)) {
      graph.set(newMapping.sourceSchemaId, new Set());
    }
    graph.get(newMapping.sourceSchemaId)?.add(newMapping.targetSchemaId);

    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (schemaId: string): boolean => {
      if (recursionStack.has(schemaId)) return true;
      if (visited.has(schemaId)) return false;

      visited.add(schemaId);
      recursionStack.add(schemaId);

      const dependencies = graph.get(schemaId) || new Set();
      for (const dependency of dependencies) {
        if (hasCycle(dependency)) return true;
      }

      recursionStack.delete(schemaId);
      return false;
    };

    return hasCycle(newMapping.sourceSchemaId);
  };

  const refreshSchemas = async () => {
    const { data: newSchemas, error } = await supabase
      .from('schemas')
      .select('*')
      .eq('pipeline_id', pipelineId);

    if (error) {
      toast({
        title: 'Error loading schemas',
        description: error instanceof Error ? error.message : 'Failed to load schemas',
        variant: 'destructive',
      });
      return;
    }

    setLocalSchemas(newSchemas);
    onOrderChange?.(newSchemas.map(s => s.id));
    toast({
      title: 'Success',
      description: 'Schemas refreshed successfully',
    });
  };

  const isValidMappingTarget = (sourceSchemaId: string, targetSchemaId: string) => {
    const sourceIndex = localSchemas.findIndex(s => s.id === sourceSchemaId);
    const targetIndex = localSchemas.findIndex(s => s.id === targetSchemaId);
    
    // Can only map to adjacent schema or from source JSON to first schema
    return sourceIndex === -1 || targetIndex === sourceIndex + 1;
  };

  const getFieldClassName = (schemaId: string) => {
    if (!selectedField) return 'cursor-pointer hover:bg-accent';
    
    if (selectedField.schemaId === schemaId) {
      return 'bg-primary/20 cursor-pointer';
    }
    
    return isValidMappingTarget(selectedField.schemaId, schemaId)
      ? 'cursor-pointer hover:bg-accent'
      : 'cursor-not-allowed opacity-50';
  };

  const handleFieldUpdate = async (schemaId: string, updatedFields: SchemaField[]) => {
    try {
      // Get current pipeline version
      const { data: pipeline, error: fetchError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (fetchError) throw fetchError;

      // Create new version
      const [major, minor, patch] = pipeline.version.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}`;

      // Update schema with new fields
      const { error: updateError } = await supabase
        .from('schemas')
        .update({ 
          fields: updatedFields,
          version: newVersion 
        })
        .eq('id', schemaId);

      if (updateError) throw updateError;

      // Update mappings for the modified schema
      const updatedMappings = mappings.filter(m => {
        if (m.sourceSchemaId === schemaId) {
          // Check if source field still exists
          return updatedFields.some(f => f.id === m.sourceFieldId);
        }
        if (m.targetSchemaId === schemaId) {
          // Check if target field still exists
          return updatedFields.some(f => f.id === m.targetFieldId);
        }
        return true;
      });

      setMappings(updatedMappings);
      
      // Refresh the local schemas
      const updatedSchemas = localSchemas.map(s =>
        s.id === schemaId ? { ...s, fields: updatedFields } : s
      );
      setLocalSchemas(updatedSchemas);

      toast({
        title: 'Success',
        description: `Schema fields updated successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error updating schema fields',
        description: error instanceof Error ? error.message : 'Failed to update schema fields',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchema = async () => {
    if (!schemaToDelete || !pipelineId) return;

    try {
      const { error } = await supabase
        .from('schemas')
        .delete()
        .eq('id', schemaToDelete.id);

      if (error) throw error;

      // Remove schema from local state
      setLocalSchemas(prev => prev.filter(s => s.id !== schemaToDelete.id));
      
      // Remove associated mappings
      setMappings(prev => prev.filter(m => 
        m.sourceSchemaId !== schemaToDelete.id && 
        m.targetSchemaId !== schemaToDelete.id
      ));

      await refreshSchemas();
    } catch (error) {
      console.error('Error deleting schema:', error);
      toast({
        title: 'Error deleting schema',
        description: 'Failed to delete schema',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SourceJsonEditor
          pipelineId={pipelineId}
          initialJson={sourceData}
          onJsonChange={onSourceJsonChange}
        />
        <Button onClick={() => setCreateSchemaOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schema
        </Button>
      </div>

      <CreateSchemaDialog
        pipelineId={pipelineId}
        sourceId={sourceId}
        sourceJson={sourceData}
        existingSchemas={localSchemas}
        onSchemaCreated={refreshSchemas}
        open={createSchemaOpen}
        onOpenChange={setCreateSchemaOpen}
      />

      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-6">
          {localSchemas.map((schema, index) => (
            <Card
              key={schema.id}
              draggable
              onDragStart={(e) => handleDragStart(e, schema.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, schema.id)}
              className={`flex-shrink-0 w-[400px] p-6 bg-card cursor-move relative ${
                draggingSchema === schema.id ? 'opacity-50' : ''
              }`}
            >
              <div className="absolute -left-3 -top-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {localSchemas.indexOf(schema) + 1}
              </div>
              {localSchemas.indexOf(schema) < localSchemas.length - 1 && (
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <ArrowRightIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{schema.name}</h3>
                    <span className="text-sm text-muted-foreground">v{schema.version}</span>
                  </div>
                  {index === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSchemaId(schema.id)}
                    >
                      Edit Fields
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSchemaToDelete(schema)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {schema.fields.map((field) => (
                    <div 
                      key={field.id}
                      ref={el => el && fieldRefs.current.set(`${schema.id}-${field.id}`, el)}
                      className={getFieldClassName(schema.id)}
                      onClick={() => handleFieldClick(schema.id, field)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{field.key}</span>
                      </div>
                      <div className="text-sm text-muted-foreground break-all">
                        Path: {field.path}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {editingSchemaId && (
          <Dialog open={!!editingSchemaId} onOpenChange={() => setEditingSchemaId(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Schema Fields</DialogTitle>
              </DialogHeader>
              <JsonAnalyzer
                initialSchema={localSchemas.find(s => s.id === editingSchemaId)}
                onFieldsChange={(fields: SchemaField[]) => {
                  handleFieldUpdate(editingSchemaId, fields);
                  setEditingSchemaId(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {mappings.map((mapping, index) => (
          <SchemaConnection
            key={index}
            mapping={mapping}
            sourceElement={getFieldRef(mapping.sourceSchemaId, mapping.sourceFieldId)}
            targetElement={getFieldRef(mapping.targetSchemaId, mapping.targetFieldId)}
            onDelete={handleDeleteMapping}
            pipelineId={pipelineId}
            onUpdate={(updatedMapping) => {
              setMappings(mappings.map(m => 
                m.sourceFieldId === updatedMapping.sourceFieldId && 
                m.targetFieldId === updatedMapping.targetFieldId ? 
                updatedMapping : m
              ));
            }}
          />
        ))}
      </div>
      <PipelinePreview 
        schemas={localSchemas}
        mappings={mappings}
        sourceData={sourceData}
      />
      {schemaToDelete && (
        <DeleteSchemaFromPipelineDialog
          schema={schemaToDelete}
          onDelete={handleDeleteSchema}
          open={!!schemaToDelete}
          onOpenChange={(open) => !open && setSchemaToDelete(null)}
        />
      )}
    </div>
  );
}