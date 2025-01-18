import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

interface ParsedJson {
  valid: boolean;
  data: JsonValue;
  error?: string;
}

interface JsonNodeProps {
  name: string;
  value: JsonValue;
  isRoot?: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const [copied, setCopied] = useState(false);

  const getValueType = (val: JsonValue): string => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = () => {
    const type = getValueType(value);

    if (value === null) {
      return <span className="text-gray-400 font-mono">null</span>;
    }

    if (type === 'string') {
      return <span className="text-green-500 font-mono">"{String(value)}"</span>;
    }

    if (type === 'number') {
      return <span className="text-blue-500 font-mono">{String(value)}</span>;
    }

    if (type === 'boolean') {
      return <span className="text-purple-500 font-mono">{String(value)}</span>;
    }

    if (type === 'object' || type === 'array') {
      const itemCount = Object.keys(value).length;
      return (
        <Badge variant="outline" className="ml-2">
          {type === 'array' ? 'Array' : 'Object'}[{itemCount}]
        </Badge>
      );
    }

    return String(value);
  };

  const isExpandable = typeof value === 'object' && value !== null;

  return (
    <div className="border-l-2 border-gray-200 pl-4 my-2">
      <div className="flex items-center group">
        {isExpandable ? (
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="flex-1 flex items-center">
          {!isRoot && (
            <span className="font-semibold text-gray-700 mr-2">{name}:</span>
          )}
          {renderValue()}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy value</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isExpandable && isExpanded && (
        <div className="ml-2">
          {Object.entries(value).map(([key, val]) => (
            <JsonNode key={key} name={key} value={val} />
          ))}
        </div>
      )}
    </div>
  );
};

const JsonAnalyzer = () => {
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

  const handleJsonInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setRawJson(input);
    if (input.trim()) {
      setParsedJson(parseJson(input));
    } else {
      setParsedJson(null);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Paste your JSON here..."
            value={rawJson}
            onChange={handleJsonInput}
            className="min-h-[200px] font-mono"
          />
        </CardContent>
      </Card>

      {parsedJson && (
        <Card>
          <CardContent className="pt-6">
            {parsedJson.valid ? (
              <div className="space-y-4">
                <JsonNode name="root" value={parsedJson.data} isRoot />
              </div>
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

export default JsonAnalyzer;