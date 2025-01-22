export interface Schema {
    id: string;
    name: string;
    source_id: string;
    user_id: string;
    fields: SchemaField[];
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateSchemaInput {
    name: string;
    source_id: string;
    fields: SchemaField[];
  }
  
  export interface SchemaField {
    id: string;
    key: string;
    path: string;
    value: string;
  }