// src/components/JsonAnalyzer/components/JsonNode.tsx

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JsonNodeProps, JsonValue } from './types';

const JsonNode: React.FC<JsonNodeProps> = ({ 
  name, 
  value, 
  isRoot = false, 
  path = '', 
  onValueSelect 
}) => {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const [copied, setCopied] = useState(false);

  const currentPath = path ? `${path}.${name}` : name;

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

  const handleValueClick = () => {
    const type = getValueType(value);
    if (type !== 'object' && type !== 'array' && onValueSelect) {
      onValueSelect(currentPath, String(value));
    }
  };

  const renderValue = () => {
    const type = getValueType(value);

    if (value === null) {
      return <span className="text-gray-400 font-mono">null</span>;
    }

    if (type === 'string' || type === 'number' || type === 'boolean') {
      return (
        <span 
          className={`font-mono cursor-pointer hover:underline
            ${type === 'string' ? 'text-green-500' : ''}
            ${type === 'number' ? 'text-blue-500' : ''}
            ${type === 'boolean' ? 'text-purple-500' : ''}`}
          onClick={handleValueClick}
        >
          {type === 'string' ? `"${String(value)}"` : String(value)}
        </span>
      );
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
            <JsonNode 
              key={key} 
              name={key} 
              value={val} 
              path={currentPath}
              onValueSelect={onValueSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JsonNode;