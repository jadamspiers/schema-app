export type TransformationType = 
  | 'none' 
  | 'timestamp' 
  | 'regex' 
  | 'uppercase' 
  | 'lowercase' 
  | 'number' 
  | 'boolean';

export interface FieldTransformation {
  type: TransformationType;
  options?: {
    timestampFormat?: string;
    regexPattern?: string;
    regexReplacement?: string;
    numberFormat?: string;
    booleanTrueValue?: string;
    booleanFalseValue?: string;
  };
}

export interface FieldMapping {
  sourceSchemaId: string;
  sourceFieldId: string;
  targetSchemaId: string;
  targetFieldId: string;
  transformation?: FieldTransformation;
  sourceType: 'json' | 'schema';
  sourceReference: string;
}

export interface PipelineMapping {
  id: string;
  version: string;
  name: string;
  mappings: FieldMapping[];
  schemaOrder: string[];
} 