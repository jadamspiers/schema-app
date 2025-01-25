import React from 'react';
import type { TemplateField, ParsedJson, JsonValue } from './types';

interface OutputSectionProps {
  fields: TemplateField[];
  parsedJson: ParsedJson | null;
}

const OutputSection: React.FC<OutputSectionProps> = ({ fields, parsedJson }) => {
  const getMappedOutput = () => {
    const output: Record<string, string> = {};
    
    if (parsedJson?.valid) {
      fields.forEach(field => {
        if (field.key && field.path) {  // Changed from field.value to field.path
          const value = getValueFromPath(parsedJson.data, field.path);
          output[field.key] = value;
        }
      });
    }
    
    return output;
  };

  const getValueFromPath = (data: JsonValue, path: string): string => {
    try {
      // Remove 'root.' prefix if it exists
      const cleanPath = path.startsWith('root.') ? path.slice(5) : path;
      const parts = cleanPath.split('.');
      let current = data;
      
      for (const part of parts) {
        if (typeof current === 'object' && current !== null) {
          current = (current as { [key: string]: JsonValue })[part];
        } else {
          return '';
        }
      }
      
      return current !== null && current !== undefined ? String(current) : '';
    } catch {
      return '';
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">Mapped Output</h3>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px]">
        {JSON.stringify(getMappedOutput(), null, 2)}
      </pre>
    </div>
  );
};
export default OutputSection;