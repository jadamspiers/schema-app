import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import JsonNode from './JsonNode';
import type { ParsedJson } from './types';

interface JsonSectionProps {
  rawJson: string;
  parsedJson: ParsedJson | null;
  onJsonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueSelect: (path: string) => void;
}

const JsonSection: React.FC<JsonSectionProps> = ({
  rawJson,
  parsedJson,
  onJsonChange,
  onValueSelect
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Paste your JSON here..."
            value={rawJson}
            onChange={onJsonChange}
            className="min-h-[200px] font-mono"
          />
        </CardContent>
      </Card>

      {parsedJson && (
        <Card>
          <CardContent className="pt-6">
            {parsedJson.valid ? (
              <JsonNode 
                name="root" 
                value={parsedJson.data} 
                isRoot 
                onValueSelect={onValueSelect}
              />
            ) : (
              <div className="text-red-500">
                Error: {parsedJson.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JsonSection; 