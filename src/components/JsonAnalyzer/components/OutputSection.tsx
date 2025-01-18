// src/components/JsonAnalyzer/components/OutputSection.tsx

import React from 'react';
import type { TemplateField } from './types';

interface OutputSectionProps {
  fields: TemplateField[];
}

const OutputSection: React.FC<OutputSectionProps> = ({ fields }) => {
  const getMappedOutput = () => {
    const output: Record<string, string> = {};
    fields.forEach(field => {
      if (field.key && field.value) {
        output[field.key] = field.value;
      }
    });
    return output;
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