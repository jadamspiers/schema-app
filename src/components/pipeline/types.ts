export interface FieldMapping {
  sourceSchemaId: string;
  sourceFieldId: string;
  targetSchemaId: string;
  targetFieldId: string;
}

export interface PipelineMapping {
  id: string;
  mappings: FieldMapping[];
  schemaOrder: string[];
} 