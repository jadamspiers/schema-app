import { Schema, SchemaField } from '@/components/schema/types';

export class SchemaTransformer {
  constructor(
    private schema: Schema,
    private sourceData: Record<string, unknown>
  ) {}

  transform(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    this.schema.fields.forEach((field) => {
      result[field.id] = this.getFieldValue(field);
    });
    
    return result;
  }

  private getFieldValue(field: SchemaField): unknown {
    return this.getValueFromPath(this.sourceData, field.path);
  }

  private getValueFromPath(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
} 