import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { FieldMapping, FieldTransformation, TransformationType } from "../types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface TransformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: FieldMapping;
  pipelineId: string;
  onUpdate: (mapping: FieldMapping) => void;
  sourceValue?: string;
}

export function TransformationDialog({ 
  open, 
  onOpenChange, 
  mapping, 
  pipelineId,
  onUpdate,
  sourceValue = "example value"
}: TransformationDialogProps) {
  const [transformation, setTransformation] = useState<FieldTransformation>({
    type: mapping.transformation?.type || 'none',
    options: mapping.transformation?.options || {}
  });
  const [previewOutput, setPreviewOutput] = useState<string>(sourceValue);
  const { toast } = useToast();

  const transformValue = (value: string, transformation: FieldTransformation): string => {
    switch (transformation.type) {
      case 'timestamp':
        return new Date().toISOString();
      case 'regex':
        try {
          const re = new RegExp(transformation.options?.regexPattern || '');
          return value.replace(re, transformation.options?.regexReplacement || '');
        } catch {
          return 'Invalid regex pattern';
        }
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) return 'Invalid number';
        
        switch (transformation.options?.numberFormat) {
          case 'integer':
            return Math.round(num).toString();
          case 'currency':
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(num);
          case 'percentage':
            return new Intl.NumberFormat('en-US', { 
              style: 'percent',
              minimumFractionDigits: 2
            }).format(num / 100);
          default:
            return num.toString();
        }
      }
      case 'boolean':
        return value.toLowerCase() === 'true' ? 
          (transformation.options?.booleanTrueValue || 'true') : 
          (transformation.options?.booleanFalseValue || 'false');
      default:
        return value;
    }
  };

  useEffect(() => {
    setPreviewOutput(transformValue(sourceValue, transformation));
  }, [transformation, sourceValue]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('field_mappings')
        .update({
          transformation_type: transformation.type,
          transformation_options: transformation.options
        })
        .match({
          pipeline_id: pipelineId,
          source_schema_id: mapping.sourceSchemaId,
          source_field_id: mapping.sourceFieldId,
          target_schema_id: mapping.targetSchemaId,
          target_field_id: mapping.targetFieldId
        });

      if (error) throw error;

      onUpdate({
        ...mapping,
        transformation
      });
      onOpenChange(false);
      toast({
        title: 'Success',
        description: 'Field transformation updated successfully',
      });
    } catch (error) {
      console.error('Failed to update transformation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update field transformation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Field Transformation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select 
              value={transformation.type} 
              onValueChange={(value: TransformationType) => 
                setTransformation({ ...transformation, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="timestamp">Timestamp</SelectItem>
                <SelectItem value="regex">Regex</SelectItem>
                <SelectItem value="uppercase">Uppercase</SelectItem>
                <SelectItem value="lowercase">Lowercase</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transformation.type === 'timestamp' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Input
                value={transformation.options?.timestampFormat || ''}
                onChange={(e) => setTransformation({
                  ...transformation,
                  options: { ...transformation.options, timestampFormat: e.target.value }
                })}
                placeholder="e.g., YYYY-MM-DD"
              />
            </div>
          )}

          {transformation.type === 'regex' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pattern</label>
                <Input
                  value={transformation.options?.regexPattern || ''}
                  onChange={(e) => setTransformation({
                    ...transformation,
                    options: { ...transformation.options, regexPattern: e.target.value }
                  })}
                  placeholder="Regular expression pattern"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Replacement</label>
                <Input
                  value={transformation.options?.regexReplacement || ''}
                  onChange={(e) => setTransformation({
                    ...transformation,
                    options: { ...transformation.options, regexReplacement: e.target.value }
                  })}
                  placeholder="Replacement string"
                />
              </div>
            </>
          )}

          {transformation.type === 'number' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Number Format</label>
              <Select 
                value={transformation.options?.numberFormat || 'decimal'}
                onValueChange={(value) => setTransformation({
                  ...transformation,
                  options: { ...transformation.options, numberFormat: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {transformation.type === 'boolean' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">True Value</label>
                <Input
                  value={transformation.options?.booleanTrueValue || 'true'}
                  onChange={(e) => setTransformation({
                    ...transformation,
                    options: { ...transformation.options, booleanTrueValue: e.target.value }
                  })}
                  placeholder="Value for true"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">False Value</label>
                <Input
                  value={transformation.options?.booleanFalseValue || 'false'}
                  onChange={(e) => setTransformation({
                    ...transformation,
                    options: { ...transformation.options, booleanFalseValue: e.target.value }
                  })}
                  placeholder="Value for false"
                />
              </div>
            </>
          )}

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Preview</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Input</span>
                <div className="p-2 rounded-md bg-muted text-sm">{sourceValue}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Output</span>
                <div className="p-2 rounded-md bg-muted text-sm">{previewOutput}</div>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Transformation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 