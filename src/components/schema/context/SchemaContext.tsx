import React, { createContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Schema, CreateSchemaInput } from '../types';

interface SchemaContextType {
  schemas: Schema[];
  loading: boolean;
  error: string | null;
  createSchema: (input: CreateSchemaInput) => Promise<Schema>;
  deleteSchema: (id: string) => Promise<void>;
  refreshSchemas: (sourceId: string) => Promise<void>;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: React.ReactNode }) {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSchemas = async (sourceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schemas')
        .select('*')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSchema = async ({ name, source_id, fields }: CreateSchemaInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('schemas')
      .insert({
        name,
        source_id,
        user_id: user.id,
        fields
      })
      .select()
      .single();

    if (error) throw error;
    await refreshSchemas(source_id);
    return data;
  };

  const deleteSchema = async (id: string) => {
    const schema = schemas.find(s => s.id === id);
    if (!schema) throw new Error('Schema not found');

    const { error } = await supabase
      .from('schemas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshSchemas(schema.source_id);
  };

  return (
    <SchemaContext.Provider value={{
      schemas,
      loading,
      error,
      createSchema,
      deleteSchema,
      refreshSchemas
    }}>
      {children}
    </SchemaContext.Provider>
  );
}

export { SchemaContext };