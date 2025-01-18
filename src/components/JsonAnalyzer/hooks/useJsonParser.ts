// src/components/JsonAnalyzer/hooks/useJsonParser.ts

import { useState, type ChangeEvent } from 'react';
import type { JsonValue, ParsedJson } from '../components/types';

export const useJsonParser = () => {
  const [rawJson, setRawJson] = useState('');
  const [parsedJson, setParsedJson] = useState<ParsedJson | null>(null);

  const parseJson = (input: string): ParsedJson => {
    try {
      const data = JSON.parse(input);
      return {
        valid: true,
        data
      };
    } catch (error) {
      return {
        valid: false,
        data: null,
        error: (error as Error).message
      };
    }
  };

  const handleJsonInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setRawJson(input);
    if (input.trim()) {
      setParsedJson(parseJson(input));
    } else {
      setParsedJson(null);
    }
  };

  const getValueFromPath = (data: JsonValue, path: string): string => {
    try {
      const parts = path.split('.');
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
  
  return {
    rawJson,
    parsedJson,
    handleJsonInput,
    getValueFromPath
  };

};