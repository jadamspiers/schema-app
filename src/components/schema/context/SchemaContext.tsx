import React, { createContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Schema, CreateSchemaInput } from '../types';

interface SchemasBySource {
  [sourceId: string]: Schema[];
}

interface SchemaContextType {
  schemasBySource: SchemasBySource;
  loading: boolean;
  error: string | null;
  createSchema: (input: CreateSchemaInput) => Promise<Schema>;
  deleteSchema: (id: string) => Promise<void>;
  refreshSchemas: (sourceIds: string[]) => Promise<void>;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: React.ReactNode }) {
  const [schemasBySource, setSchemasBySource] = useState<SchemasBySource>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSchemas = async (sourceIds: string[]) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schemas')
        .select('*')
        .in('source_id', sourceIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const schemasMap = data.reduce((acc: SchemasBySource, schema) => {
        if (!acc[schema.source_id]) {
          acc[schema.source_id] = [];
        }
        acc[schema.source_id].push(schema);
        return acc;
      }, {});

      setSchemasBySource(schemasMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSchema = async (input: CreateSchemaInput): Promise<Schema> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('schemas')
      .insert({
        name: input.name,
        source_id: input.source_id,
        user_id: user.id,
        fields: input.fields
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteSchema = async (id: string) => {
    const { error } = await supabase
      .from('schemas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return (
    <SchemaContext.Provider value={{
      schemasBySource,
      loading,
      error,
      refreshSchemas,
      createSchema: async (input) => {
        const schema = await createSchema(input);
        await refreshSchemas([input.source_id]);
        return schema;
      },
      deleteSchema: async (id) => {
        await deleteSchema(id);
        await refreshSchemas(Object.keys(schemasBySource));
      }
    }}>
      {children}
    </SchemaContext.Provider>
  );
}

export { SchemaContext };