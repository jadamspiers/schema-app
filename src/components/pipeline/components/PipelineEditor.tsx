import { Schema, SchemaField } from '@/components/schema/types';
import { Card } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';
import { FieldMapping } from '../types';
import { SchemaConnection } from './SchemaConnection';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';

interface PipelineEditorProps {
  schemas: Schema[];
  onOrderChange?: (schemaIds: string[]) => void;
}

export function PipelineEditor({ schemas, onOrderChange }: PipelineEditorProps) {
  const [localSchemas, setLocalSchemas] = useState(schemas);
  const [selectedField, setSelectedField] = useState<{
    schemaId: string;
    field: SchemaField;
  } | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [draggingSchema, setDraggingSchema] = useState<string | null>(null);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setLocalSchemas(schemas);
  }, [schemas]);

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

  const handleFieldClick = (schemaId: string, field: SchemaField) => {
    if (!selectedField) {
      setSelectedField({ schemaId, field });
    } else if (selectedField.schemaId !== schemaId) {
      // Create new mapping
      const newMapping: FieldMapping = {
        sourceSchemaId: selectedField.schemaId,
        sourceFieldId: selectedField.field.id,
        targetSchemaId: schemaId,
        targetFieldId: field.id
      };
      setMappings([...mappings, newMapping]);
      setSelectedField(null);
    }
  };

  const getFieldRef = (schemaId: string, fieldId: string) => {
    return fieldRefs.current.get(`${schemaId}-${fieldId}`) || null;
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
        />
      ))}
    </div>
  );
}