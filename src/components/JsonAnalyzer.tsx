import { Schema, SchemaField } from '@/components/schema/types';
import { useEffect } from 'react';
import TemplateSection from './JsonAnalyzer/components/TemplateSection';
import JsonSection from './JsonAnalyzer/components/JsonSection';
import { useJsonParser } from './JsonAnalyzer/hooks/useJsonParser';
import { useTemplateFields } from './JsonAnalyzer/hooks/useTemplateFields';

export interface JsonAnalyzerProps {
  onFieldsChange: (fields: SchemaField[]) => void;
  initialSchema?: Schema;
  sourceJson?: Record<string, unknown>;
  selectedSourceId?: string;
  existingSchemas?: Schema[];
}

const JsonAnalyzer: React.FC<JsonAnalyzerProps> = ({ initialSchema, onFieldsChange, sourceJson, selectedSourceId, existingSchemas }) => {
  const selectedSchema = selectedSourceId && selectedSourceId !== 'source' 
    ? existingSchemas?.find(s => s.id === selectedSourceId) 
    : undefined;
    
  const { rawJson, parsedJson, handleJsonInput } = useJsonParser(
    selectedSchema?.example_json || (sourceJson ? JSON.stringify(sourceJson, null, 2) : initialSchema?.example_json)
  );
  const {
    fields,
    isModified,
    addField,
    removeField,
    updateField,
    handleValueSelect
  } = useTemplateFields(initialSchema?.fields || []);

  useEffect(() => {
    onFieldsChange?.(fields);
  }, [fields, onFieldsChange]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <JsonSection 
        rawJson={rawJson}
        parsedJson={parsedJson}
        onJsonChange={handleJsonInput}
        onValueSelect={handleValueSelect}
      />
      <TemplateSection
        fields={fields}
        onAddField={addField}
        onRemoveField={removeField}
        onUpdateField={updateField}
        rawJson={rawJson}
        initialSchema={initialSchema}
        isModified={isModified}
      />
    </div>
  );
};

export default JsonAnalyzer; 