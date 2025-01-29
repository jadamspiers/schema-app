import { FieldMapping } from "@/components/pipeline/types";
import { Schema } from "@/components/schema/types";
import { FieldTransformation } from '@/components/pipeline/types';
import get from 'lodash/get';

export class TransformationEngine {
  constructor(
    private schemas: Schema[],
    private mappings: FieldMapping[],
    private sourceData: Record<string, unknown>
  ) {}

  private getSchemaById(id: string): Schema | undefined {
    return this.schemas.find(s => s.id === id);
  }

  private transformValue(value: unknown, transformation?: FieldTransformation): unknown {
    if (!transformation || transformation.type === 'none') {
      return value;
    }

    const stringValue = String(value);
    switch (transformation.type) {
      case 'timestamp':
        return new Date().toISOString();
      case 'regex':
        try {
          const re = new RegExp(transformation.options?.regexPattern || '');
          return stringValue.replace(re, transformation.options?.regexReplacement || '');
        } catch {
          return value;
        }
      case 'uppercase':
        return stringValue.toUpperCase();
      case 'lowercase':
        return stringValue.toLowerCase();
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) return value;
        
        switch (transformation.options?.numberFormat) {
          case 'integer':
            return Math.round(num);
          case 'currency':
            return Number(num.toFixed(2));
          case 'percentage':
            return num / 100;
          default:
            return num;
        }
      }
      case 'boolean': {
        const isTrue = stringValue.toLowerCase() === 'true';
        return isTrue ? 
          (transformation.options?.booleanTrueValue ?? true) : 
          (transformation.options?.booleanFalseValue ?? false);
      }
      default:
        return value;
    }
  }

  public transform(): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];

    for (const schema of this.schemas) {
      const schemaResult: Record<string, unknown> = {};
      const schemaMappings = this.mappings.filter(m => m.targetSchemaId === schema.id);
      
      for (const mapping of schemaMappings) {
        try {
          let sourceValue: unknown;
          
          if (mapping.sourceType === 'json') {
            sourceValue = this.getValueFromPath(this.sourceData, mapping.sourceReference);
          } else {
            const sourceSchemaIndex = this.schemas.findIndex(s => s.id === mapping.sourceSchemaId);
            if (sourceSchemaIndex >= 0) {
              sourceValue = result[sourceSchemaIndex]?.[mapping.sourceFieldId];
            }
          }

          const transformedValue = this.transformValue(sourceValue, mapping.transformation);
          schemaResult[mapping.targetFieldId] = transformedValue;
        } catch {
          schemaResult[mapping.targetFieldId] = null;
        }
      }

      // Add default values for unmapped fields
      for (const field of schema.fields) {
        if (!(field.id in schemaResult)) {
          schemaResult[field.id] = '';  // Default to empty string for all fields
        }
      }
      
      result.push(schemaResult);
    }

    return result;
  }

  public transformWithIntermediates(): { 
    finalResult: Record<string, unknown>[],
    intermediateSteps: Record<string, unknown>[] 
  } {
    const intermediateSteps: Record<string, unknown>[] = [];
    const finalResult = this.transform();
    
    for (const schema of this.schemas) {
      const result: Record<string, unknown> = {};
      
      for (const field of schema.fields) {
        // For the first schema, extract values directly from source JSON
        if (schema.id === this.schemas[0].id) {
          result[field.key] = get(this.sourceData, field.path.replace('root.', ''));
        }
        // For subsequent schemas, use mappings (to be implemented)
      }

      intermediateSteps.push(result);
    }

    return { finalResult, intermediateSteps };
  }

  private getValueFromPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }
} 