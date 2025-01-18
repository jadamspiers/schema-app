// src/components/JsonAnalyzer/hooks/useTemplateFields.ts

import { useState } from 'react';
import type { TemplateField } from '../components/types';

const DEFAULT_FIELDS: TemplateField[] = [
  { id: '1', key: 'name', path: '', value: '' },
  { id: '2', key: 'value', path: '', value: '' }
];

export const useTemplateFields = (initialFields: TemplateField[] = DEFAULT_FIELDS) => {
  const [fields, setFields] = useState<TemplateField[]>(initialFields);

  const addField = () => {
    const newId = String(Date.now());
    setFields([
      ...fields,
      { id: newId, key: '', path: '', value: '' }
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleValueSelect = (path: string, value: string) => {
    // Find the first empty field or the last field if none are empty
    const targetField = fields.find(f => !f.value) || fields[fields.length - 1];
    if (targetField) {
      updateField(targetField.id, { value, path });
    } else {
      // If no fields exist, create a new one
      const newId = String(Date.now());
      setFields([...fields, { id: newId, key: '', path, value }]);
    }
  };

  const getFieldsOutput = () => {
    return fields.reduce((output, field) => {
      if (field.key && field.value) {
        output[field.key] = field.value;
      }
      return output;
    }, {} as Record<string, string>);
  };

  return {
    fields,
    addField,
    removeField,
    updateField,
    handleValueSelect,
    getFieldsOutput
  };
};