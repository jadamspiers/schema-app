import { useContext } from 'react';
import { SchemaContext } from '../context/SchemaContext';

export function useSchema() {
  const context = useContext(SchemaContext);
  if (context === undefined) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
}