import { useContext } from 'react';
import { SourceContext } from '../context/SourceContext';

export function useSource() {
  const context = useContext(SourceContext);
  if (context === undefined) {
    throw new Error('useSource must be used within a SourceProvider');
  }
  return context;
} 