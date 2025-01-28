import { createContext } from 'react';
import type { SourceContextType } from '../types';

export const SourceContext = createContext<SourceContextType | undefined>(undefined); 