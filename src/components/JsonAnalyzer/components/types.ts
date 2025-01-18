// src/components/JsonAnalyzer/components/types.ts

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface ParsedJson {
  valid: boolean;
  data: JsonValue;
  error?: string;
}

export interface TemplateField {
  id: string;
  key: string;
  path: string;
  value: string;
}

export interface JsonNodeProps {
  name: string;
  value: JsonValue;
  isRoot?: boolean;
  path?: string;
  onValueSelect?: (path: string, value: string) => void;
}