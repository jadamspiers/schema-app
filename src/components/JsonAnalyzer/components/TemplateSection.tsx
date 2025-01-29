import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveSchemaDialog } from '@/components/schema/components/SaveSchemaDialog';
import type { Schema } from '@/components/schema/types';
import type { SchemaField } from '@/components/schema/types';

interface TemplateSectionProps {
  fields: SchemaField[];
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onUpdateField: (id: string, updates: Partial<SchemaField>) => void;
  rawJson: string;
  initialSchema?: Schema;
  isModified: boolean;
  isEditMode?: boolean;
  onSave?: () => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  fields,
  onAddField,
  onRemoveField,
  onUpdateField,
  rawJson,
  initialSchema,
  isModified,
  isEditMode,
  onSave
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Template Mapping</h3>
        <div className="space-x-2">
          <Button onClick={onAddField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
          {isEditMode ? (
            <Button 
              onClick={onSave}
              size="sm" 
              variant="default"
              disabled={!isModified}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button 
              onClick={() => setSaveDialogOpen(true)} 
              size="sm" 
              variant={initialSchema ? "secondary" : "outline"}
            >
              <Save className="h-4 w-4 mr-2" />
              {initialSchema ? 'Update Schema' : 'Save Schema'}
            </Button>
          )}
        </div>
      </div>
      
      {fields.map((field) => (
        <div key={field.id} className="flex items-center space-x-2">
          <Input
            placeholder="Key name"
            value={field.key}
            onChange={(e) => onUpdateField(field.id, { key: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Value from JSON"
            value={field.value}
            onChange={(e) => onUpdateField(field.id, { value: e.target.value })}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveField(field.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}

      <SaveSchemaDialog
        fields={fields}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        exampleJson={rawJson}
        initialSchema={initialSchema}
        isModified={isModified}
      />
    </div>
  );
};

export default TemplateSection;