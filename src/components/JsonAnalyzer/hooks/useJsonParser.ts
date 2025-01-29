import { useState, useEffect } from 'react';
import type { ParsedJson } from '../components/types';

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

export const useJsonParser = (initialJson?: string) => {
  const [rawJson, setRawJson] = useState(initialJson || '');
  const [parsedJson, setParsedJson] = useState<ParsedJson | null>(() => {
    if (initialJson) {
      return parseJson(initialJson);
    }
    return null;
  });

  const handleJsonInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setRawJson(input);
    if (input.trim()) {
      setParsedJson(parseJson(input));
    } else {
      setParsedJson(null);
    }
  };

  useEffect(() => {
    if (initialJson) {
      setRawJson(initialJson);
      setParsedJson(parseJson(initialJson));
    }
  }, [initialJson]);

  return {
    rawJson,
    parsedJson,
    handleJsonInput
  };
};