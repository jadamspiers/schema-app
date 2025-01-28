import { Schema, SchemaField } from '@/components/schema/types';
import { Card } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';
import { FieldMapping } from '../types';
import { SchemaConnection } from './SchemaConnection';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PipelineEditorProps {
  schemas: Schema[];
  pipelineId: string;
  onOrderChange?: (schemaIds: string[]) => void;
}

export function PipelineEditor({ schemas, pipelineId, onOrderChange }: PipelineEditorProps) {
  const [localSchemas, setLocalSchemas] = useState(schemas);
  const [selectedField, setSelectedField] = useState<{
    schemaId: string;
    field: SchemaField;
  } | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [draggingSchema, setDraggingSchema] = useState<string | null>(null);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toast } = useToast();

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
        targetFieldId: m.target_field_id
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

  const handleDrop = (e: React.DragEvent, targetSchemaId: string) => {
    e.preventDefault();
    if (!draggingSchema || draggingSchema === targetSchemaId) return;

    const newOrder = localSchemas.map(s => s.id);
    const fromIndex = newOrder.indexOf(draggingSchema);
    const toIndex = newOrder.indexOf(targetSchemaId);

    const reorderedSchemas = [...localSchemas];
    const [movedSchema] = reorderedSchemas.splice(fromIndex, 1);
    reorderedSchemas.splice(toIndex, 0, movedSchema);

    setLocalSchemas(reorderedSchemas);
    onOrderChange?.(reorderedSchemas.map(s => s.id));
    setDraggingSchema(null);
  };

  const handleFieldClick = async (schemaId: string, field: SchemaField) => {
    if (!selectedField) {
      setSelectedField({ schemaId, field });
    } else if (selectedField.schemaId !== schemaId) {
      const newMapping: FieldMapping = {
        sourceSchemaId: selectedField.schemaId,
        sourceFieldId: selectedField.field.id,
        targetSchemaId: schemaId,
        targetFieldId: field.id
      };

      if (wouldCreateCycle(newMapping)) {
        toast({
          title: 'Invalid Mapping',
          description: 'This mapping would create a circular dependency',
          variant: 'destructive',
        });
        setSelectedField(null);
        return;
      }

      try {
        const { error } = await supabase
          .from('field_mappings')
          .insert({
            pipeline_id: pipelineId,
            source_schema_id: newMapping.sourceSchemaId,
            source_field_id: newMapping.sourceFieldId,
            target_schema_id: newMapping.targetSchemaId,
            target_field_id: newMapping.targetFieldId
          });

        if (error) throw error;
        
        setMappings([...mappings, newMapping]);
        setSelectedField(null);
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
      const { error } = await supabase
        .from('field_mappings')
        .delete()
        .match({
          pipeline_id: pipelineId,
          source_schema_id: mapping.sourceSchemaId,
          source_field_id: mapping.sourceFieldId,
          target_schema_id: mapping.targetSchemaId,
          target_field_id: mapping.targetFieldId
        });

      if (error) throw error;
      
      setMappings(mappings.filter(m => 
        !(m.sourceSchemaId === mapping.sourceSchemaId && 
          m.sourceFieldId === mapping.sourceFieldId &&
          m.targetSchemaId === mapping.targetSchemaId &&
          m.targetFieldId === mapping.targetFieldId)
      ));

      toast({
        title: 'Mapping deleted',
        description: 'Field mapping has been removed',
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

  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-6">
        {localSchemas.map((schema) => (
          <Card
            key={schema.id}
            draggable
            onDragStart={(e) => handleDragStart(e, schema.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, schema.id)}
            className={`flex-shrink-0 w-[400px] p-6 bg-card cursor-move ${
              draggingSchema === schema.id ? 'opacity-50' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{schema.name}</h3>
                </div>
                <span className="text-sm text-muted-foreground">v{schema.version}</span>
              </div>
              
              <div className="space-y-3">
                {schema.fields.map((field) => (
                  <div 
                    key={field.id}
                    ref={el => el && fieldRefs.current.set(`${schema.id}-${field.id}`, el)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedField?.schemaId === schema.id && selectedField.field.id === field.id
                        ? 'bg-primary/20 border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
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

      {mappings.map((mapping, index) => (
        <SchemaConnection
          key={index}
          mapping={mapping}
          sourceElement={getFieldRef(mapping.sourceSchemaId, mapping.sourceFieldId)}
          targetElement={getFieldRef(mapping.targetSchemaId, mapping.targetFieldId)}
          onDelete={handleDeleteMapping}
        />
      ))}
    </div>
  );
}