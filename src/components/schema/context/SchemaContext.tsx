import React, { createContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Schema, CreateSchemaInput } from '../types';

interface SchemasByPipeline {
  [pipelineId: string]: Schema[];
}

interface SchemaContextType {
  schemasByPipeline: SchemasByPipeline;
  loading: boolean;
  error: string | null;
  createSchema: (input: CreateSchemaInput) => Promise<Schema>;
  deleteSchema: (id: string) => Promise<void>;
  refreshSchemas: (pipelineIds: string[]) => Promise<void>;
  updateSchema: (id: string, input: Partial<CreateSchemaInput>) => Promise<Schema>;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: React.ReactNode }) {
  const [schemasByPipeline, setSchemasByPipeline] = useState<SchemasByPipeline>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSchemas = async (pipelineIds: string[]) => {
    try {
      setLoading(true);
      const schemasResults = [];
      const pipelinesResults = [];

      // Fetch schemas and pipelines
      for (const pipelineId of pipelineIds) {
        const [schemasResponse, pipelineResponse] = await Promise.all([
          supabase
            .from('schemas')
            .select('*')
            .eq('pipeline_id', pipelineId),
          supabase
            .from('pipelines')
            .select('id, schema_order')
            .eq('id', pipelineId)
            .single()
        ]);

        if (schemasResponse.error) throw schemasResponse.error;
        if (pipelineResponse.error) throw pipelineResponse.error;

        if (schemasResponse.data) schemasResults.push(...schemasResponse.data);
        if (pipelineResponse.data) pipelinesResults.push(pipelineResponse.data);
      }

      const schemasMap = schemasResults.reduce((acc: SchemasByPipeline, schema) => {
        if (!acc[schema.pipeline_id]) {
          acc[schema.pipeline_id] = [];
        }
        acc[schema.pipeline_id].push(schema);
        return acc;
      }, {});

      // Apply schema ordering
      pipelinesResults.forEach(pipeline => {
        if (pipeline.schema_order && schemasMap[pipeline.id]) {
          const orderMap = new Map(pipeline.schema_order.map((id: string, index: number) => [id, index]));
          schemasMap[pipeline.id].sort((a, b) => {
            const aIndex = (orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) as number;
            const bIndex = (orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER) as number;
            return aIndex - bIndex;
          });
        }
      });

      setSchemasByPipeline(schemasMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error refreshing schemas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSchema = async (input: CreateSchemaInput): Promise<Schema> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('schemas')
        .insert({
          name: input.name,
          pipeline_id: input.pipeline_id,
          source_id: input.source_id,
          user_id: user.id,
          fields: input.fields,
          example_json: input.example_json,
          version: input.version
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Create schema error:', error);
      throw error;
    }
  };

  const deleteSchema = async (id: string) => {
    const { error } = await supabase
      .from('schemas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const updateSchema = async (id: string, input: Partial<CreateSchemaInput>): Promise<Schema> => {
    const { data, error } = await supabase
      .from('schemas')
      .update({
        name: input.name,
        fields: input.fields,
        example_json: input.example_json,
        version: input.version
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return (
    <SchemaContext.Provider value={{
      schemasByPipeline,
      loading,
      error,
      refreshSchemas,
      createSchema: async (input) => {
        const schema = await createSchema(input);
        setSchemasByPipeline(prev => ({
          ...prev,
          [input.pipeline_id]: [schema, ...(prev[input.pipeline_id] || [])]
        }));
        return schema;
      },
      deleteSchema: async (id) => {
        const { data: schema } = await supabase
          .from('schemas')
          .select('pipeline_id')
          .eq('id', id)
          .single();
        
        await deleteSchema(id);
        
        if (schema) {
          setSchemasByPipeline(prev => ({
            ...prev,
            [schema.pipeline_id]: prev[schema.pipeline_id]?.filter(s => s.id !== id) || []
          }));
        }
      },
      updateSchema: async (id, input) => {
        const schema = await updateSchema(id, input);
        setSchemasByPipeline(prev => ({
          ...prev,
          [schema.pipeline_id]: prev[schema.pipeline_id]?.map(s => 
            s.id === id ? schema : s
          ) || []
        }));
        return schema;
      }
    }}>
      {children}
    </SchemaContext.Provider>
  );
}

export { SchemaContext };