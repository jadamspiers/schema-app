import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface SourceJsonEditorProps {
  pipelineId: string;
  initialJson?: Record<string, unknown>;
  onJsonChange: (json: Record<string, unknown>) => void;
}

export function SourceJsonEditor({ pipelineId, initialJson, onJsonChange }: SourceJsonEditorProps) {
  const [rawJson, setRawJson] = useState(() => 
    initialJson ? JSON.stringify(initialJson, null, 2) : '{}'
  );
  const { toast } = useToast();

  useEffect(() => {
    if (initialJson) {
      setRawJson(JSON.stringify(initialJson, null, 2));
    }
  }, [initialJson]);

  const handleSave = async () => {
    try {
      const parsedJson = JSON.parse(rawJson);
      
      const { error } = await supabase
        .from('pipelines')
        .update({ source_json: parsedJson })
        .eq('id', pipelineId);

      if (error) throw error;

      onJsonChange(parsedJson);
      toast({
        title: 'Success',
        description: 'Source JSON updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid JSON format',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Source JSON</h3>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <Textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder="Paste your JSON here..."
            className="min-h-[200px] font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
} 