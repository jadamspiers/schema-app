import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from 'lucide-react';
import type { Schema, SchemaField } from '../types';
import { useTemplateFields } from '@/components/JsonAnalyzer/hooks/useTemplateFields';
import JsonNode from '@/components/JsonAnalyzer/components/JsonNode';
import { useJsonParser } from '@/components/JsonAnalyzer/hooks/useJsonParser';

interface SchemaFieldEditorProps {
  schema: Schema;
  inputJson: Record<string, unknown>;
  onSave: (fields: SchemaField[]) => void;
  onCancel: () => void;
}

export function SchemaFieldEditor({ schema, inputJson, onSave, onCancel }: SchemaFieldEditorProps) {
  const { parsedJson } = useJsonParser(JSON.stringify(inputJson || {}));
  const {
    fields,
    isModified,
    addField,
    removeField,
    updateField,
    handleValueSelect
  } = useTemplateFields(schema.fields);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left side - JSON viewer */}
      <div className="space-y-4">
        <h3 className="font-semibold">Input JSON</h3>
        <JsonNode 
          name="root" 
          value={parsedJson?.data || {}} 
          isRoot 
          onValueSelect={handleValueSelect}
        />
      </div>

      {/* Right side - Field editor */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Edit Schema Fields</h3>
          <div className="space-x-2">
            <Button onClick={addField} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
            <Button 
              onClick={() => onSave(fields)}
              size="sm" 
              variant="default"
              disabled={!isModified}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              onClick={onCancel}
              size="sm" 
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
        
        {fields.map((field) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Input
              placeholder="Key name"
              value={field.key}
              onChange={(e) => updateField(field.id, { key: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="Value from JSON"
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 