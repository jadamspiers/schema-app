import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import JsonNode from './components/JsonNode';
import TemplateSection from './components/TemplateSection';
import OutputSection from './components/OutputSection';
import { useJsonParser } from './hooks/useJsonParser';
import { useTemplateFields } from './hooks/useTemplateFields';
import { DeleteSchemaDialog } from '../schema/components/DeleteSchemaDialog';
import type { Schema, SchemaField } from '../schema/types';

interface JsonAnalyzerProps {
  onFieldsChange?: (fields: SchemaField[]) => void;
  initialSchema?: Schema;
  isEditMode?: boolean;
  onSave?: (fields: SchemaField[]) => void;
  sourceJson?: Record<string, unknown>;
  hideJsonInput?: boolean;
}

const JsonAnalyzer: React.FC<JsonAnalyzerProps> = ({
  initialSchema,
  onFieldsChange,
  isEditMode,
  onSave,
  sourceJson,
  hideJsonInput = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { rawJson, parsedJson, handleJsonInput } = useJsonParser(
    hideJsonInput ? JSON.stringify(sourceJson) : initialSchema?.example_json
  );
  const {
    fields,
    isModified,
    addField,
    removeField,
    updateField,
    handleValueSelect
  } = useTemplateFields(initialSchema?.fields || [
    { id: '1', key: 'field1', path: '', value: '' },
    { id: '2', key: 'field2', path: '', value: '' }
  ]);

  useEffect(() => {
    if (!isEditMode) {
      onFieldsChange?.(fields);
    }
  }, [fields, onFieldsChange, isEditMode]);

  return (
    <div className="space-y-4">
      {initialSchema && (
        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{initialSchema.name}</h2>
            <span className="text-sm text-muted-foreground">v{initialSchema.version}</span>
          </div>
          <div className="flex items-center gap-2">
            {isModified && (
              <span className="text-sm text-yellow-600">Unsaved changes</span>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Schema
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column - JSON Viewer */}
        <div className="space-y-4">
          {!hideJsonInput && (
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Paste your JSON here..."
                  value={rawJson}
                  onChange={handleJsonInput}
                  className="min-h-[200px] font-mono"
                />
              </CardContent>
            </Card>
          )}

          {parsedJson && (
            <Card>
              <CardContent className="pt-6">
                {parsedJson.valid ? (
                  <div className="space-y-4">
                    <JsonNode 
                      name="root" 
                      value={parsedJson.data} 
                      isRoot 
                      onValueSelect={handleValueSelect}
                    />
                  </div>
                ) : (
                  <div className="text-red-500">
                    Error: {parsedJson.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle Column - Template Fields */}
        <div className="col-span-2">
          <Card>
            <CardContent className="pt-6">
              <TemplateSection
                fields={fields}
                onAddField={addField}
                onRemoveField={removeField}
                onUpdateField={updateField}
                rawJson={rawJson}
                initialSchema={initialSchema}
                isModified={isModified}
                isEditMode={isEditMode}
                onSave={() => onSave?.(fields)}
              />
            </CardContent>
          </Card>

          {parsedJson?.valid && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <OutputSection 
                  fields={fields}
                  parsedJson={parsedJson}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {initialSchema && (
        <DeleteSchemaDialog
          schema={initialSchema}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
}

export default JsonAnalyzer;