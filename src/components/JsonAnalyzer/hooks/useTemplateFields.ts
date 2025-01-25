import { useState } from 'react';
import type { TemplateField } from '../components/types';

const DEFAULT_FIELDS: TemplateField[] = [
  { id: '1', key: 'name', path: '', value: '' },
  { id: '2', key: 'value', path: '', value: '' }
];

export const useTemplateFields = (initialFields: TemplateField[] = DEFAULT_FIELDS) => {
  const [fields, setFields] = useState<TemplateField[]>(initialFields);
  const [isModified, setIsModified] = useState(false);

  const addField = () => {
    const newId = String(Date.now());
    setFields(currentFields => [
      ...currentFields,
      { id: newId, key: '', path: '', value: '' }
    ]);
    setIsModified(true);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    setIsModified(true);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
    setIsModified(true);
  };

  const handleValueSelect = (path: string) => {
    const targetField = fields.find(f => !f.value) || fields[fields.length - 1];
    if (targetField) {
      updateField(targetField.id, { path, value: path });
    } else {
      const newId = String(Date.now());
      setFields([...fields, { id: newId, key: '', path, value: path }]);
      setIsModified(true);
    }
  };

  const resetModified = () => {
    setIsModified(false);
  };

  return {
    fields,
    isModified,
    addField,
    removeField,
    updateField,
    handleValueSelect,
    resetModified
  };
};