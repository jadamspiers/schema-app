import { useParams } from 'react-router-dom';
import { useSource } from '@/components/source/context/SourceContext';
import { useSchema } from '@/components/schema/hooks/useSchema';
import { Header } from '@/components/layout/Header';
import { PipelineEditor } from '@/components/pipeline/components/PipelineEditor';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const PipelineEditorPage = () => {
  const { sourceId, pipelineId } = useParams();
  const { sources } = useSource();
  const { schemasByPipeline, refreshSchemas } = useSchema();
  const { toast } = useToast();
  const [sourceData, setSourceData] = useState<Record<string, unknown> | null>(null);
  
  const handleOrderChange = async (schemaIds: string[]) => {
    if (!pipelineId) return;
    
    try {
      const { error } = await supabase
        .from('pipelines')
        .update({ schema_order: schemaIds })
        .eq('id', pipelineId);

      if (error) throw error;
      
      // Don't refresh schemas here - let the local state handle the order
      toast({
        title: 'Schema order updated',
        description: 'The pipeline schema order has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating schema order:', error);
      toast({
        title: 'Error updating schema order',
        description: 'There was a problem updating the schema order. Please try again.',
        variant: 'destructive',
      });
      // Only refresh on error to revert the order
      await refreshSchemas([pipelineId]);
    }
  };

  const handleSourceJsonChange = async (json: Record<string, unknown>) => {
    setSourceData(json);
  };

  useEffect(() => {
    const fetchSourceData = async () => {
      if (!sourceId) return;
      
      const { data, error } = await supabase
        .from('sources')
        .select('id, name')
        .eq('id', sourceId)
        .single();
        
      if (error) {
        console.error('Error fetching source data:', error);
        toast({
          title: 'Error loading source data',
          description: 'Failed to load source data',
          variant: 'destructive',
        });
        return;
      }
      
      if (data?.name) {
        setSourceData(data.name);
      }
    };

    fetchSourceData();
  }, [sourceId, toast]);

  const source = sources.find(s => s.id === sourceId);
  const pipeline = source?.pipelines?.find(p => p.id === pipelineId);
  const schemas = schemasByPipeline[pipelineId || ''] || [];

  return (
    <div>
      <Header 
        title="Pipeline Editor" 
        sourceName={source?.name}
        subtitle={pipeline?.name}
        showBack 
      />
      <div className="container mx-auto py-8">
        <PipelineEditor 
          schemas={schemas} 
          pipelineId={pipelineId || ''}
          onOrderChange={handleOrderChange}
          sourceData={sourceData || {}}
          onSourceJsonChange={handleSourceJsonChange}
          sourceId={sourceId || ''}
        />
      </div>
    </div>
  );
};

export default PipelineEditorPage;