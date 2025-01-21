import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Source } from '../types';

interface SourceContextType {
  sources: Source[];
  loading: boolean;
  error: string | null;
  refreshSources: () => Promise<void>;
  createSource: (name: string, description?: string) => Promise<Source>;
  deleteSource: (id: string) => Promise<void>;
}

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSource = async (name: string, description?: string) => {
    const { data, error } = await supabase
      .from('sources')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    await refreshSources();
    return data;
  };

  const deleteSource = async (id: string) => {
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshSources();
  };

  useEffect(() => {
    refreshSources();
  }, []);

  return (
    <SourceContext.Provider value={{
      sources,
      loading,
      error,
      refreshSources,
      createSource,
      deleteSource
    }}>
      {children}
    </SourceContext.Provider>
  );
}

export function useSource() {
  const context = useContext(SourceContext);
  if (context === undefined) {
    throw new Error('useSource must be used within a SourceProvider');
  }
  return context;
}