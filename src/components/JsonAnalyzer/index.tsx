import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import JsonNode from './components/JsonNode';
import TemplateSection from './components/TemplateSection';
import OutputSection from './components/OutputSection';
import { useJsonParser } from './hooks/useJsonParser';
import { useTemplateFields } from './hooks/useTemplateFields';
import type { Schema } from '@/components/schema/types';

interface JsonAnalyzerProps {
  initialSchema?: Schema;
}

const JsonAnalyzer: React.FC<JsonAnalyzerProps> = ({ initialSchema }) => {
  const { rawJson, parsedJson, handleJsonInput } = useJsonParser(initialSchema?.example_json);
  const {
    fields,
    addField,
    removeField,
    updateField,
    handleValueSelect,
    setFields
  } = useTemplateFields(initialSchema?.fields || [
    { id: '1', key: 'field1', path: '', value: '' },
    { id: '2', key: 'field2', path: '', value: '' }
  ]);

  React.useEffect(() => {
    if (initialSchema?.fields) {
      setFields(initialSchema.fields);
    }
  }, [initialSchema]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Left Column - JSON Viewer */}
      <div className="space-y-4">
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

      {/* Middle Column - Template Editor */}
      <Card className="h-fit">
        <CardContent className="pt-6">
          <TemplateSection
            fields={fields}
            onAddField={addField}
            onRemoveField={removeField}
            onUpdateField={updateField}
            rawJson={rawJson}
            initialSchema={initialSchema}
          />
        </CardContent>
      </Card>

      {/* Right Column - Output */}
      <Card className="h-fit">
        <CardContent className="pt-6">
          <OutputSection 
            fields={fields}
            parsedJson={parsedJson}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonAnalyzer;