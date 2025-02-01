import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Schema } from '@/components/schema/types';
import { FieldMapping } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PipelinePreviewProps {
  schemas: Schema[];
  mappings: FieldMapping[];
  sourceData: Record<string, unknown>;
}

export function PipelinePreview({ schemas, mappings, sourceData }: PipelinePreviewProps) {
  const [intermediateResults, setIntermediateResults] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handlePreview();
  }, [schemas, mappings, sourceData]);

  const generateOutputFromSchema = (schema: Schema, inputJson: Record<string, unknown>) => {
    const output: Record<string, unknown> = {}; 
    
    for (const field of schema.fields) {
      try {
        const pathParts = field.path.split('.');
        let currentValue: unknown = inputJson;
        
        for (const part of pathParts) {
          if (!currentValue || typeof currentValue !== 'object') {
            currentValue = undefined;
            break;
          }

          if (Array.isArray(currentValue)) {
            const index = parseInt(part, 10);
            currentValue = isNaN(index) ? undefined : currentValue[index];
          } else {
            const objValue = currentValue as Record<string, unknown>;
            currentValue = objValue[part];
          }
        }
        
        if (currentValue !== undefined) {
          output[field.key] = currentValue;
        }
      } catch (err) {
        console.error(`Error extracting value for field ${field.key}:`, err);
      }
    }
    
    return output;
  };

  const handlePreview = () => {
    try {
      const results: Record<string, unknown>[] = [];
      let currentInput = sourceData;

      for (const schema of schemas) {
        const output = generateOutputFromSchema(schema, currentInput);
        results.push(output);
        currentInput = output; // Use this schema's output as input for the next schema
      }

      setIntermediateResults(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transform data');
      setIntermediateResults([]);
    }
  };

  return (
    <Card className="mt-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <Button onClick={handlePreview} size="sm">
          <Play className="h-4 w-4 mr-2" />
          Run Preview
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">
              S
            </div>
            <h4 className="font-medium">Source JSON</h4>
          </div>
          <ScrollArea className="h-[200px] rounded-md border p-2">
            <pre className="text-sm">
              {JSON.stringify(sourceData, null, 2)}
            </pre>
          </ScrollArea>
        </div>

        {schemas.map((schema, index) => (
          <div key={schema.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                {index + 1}
              </div>
              <h4 className="font-medium">{schema.name}</h4>
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <pre className="text-sm">
                {JSON.stringify(intermediateResults[index] || {}, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        ))}
      </div>
    </Card>
  );
} 