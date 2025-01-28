export interface Source {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
    pipelines?: Pipeline[]; // Add this
  }
  
  export interface Pipeline {
    id: string;
    name: string;
    version: string;
    source_id: string;
    created_at: string;
    updated_at: string;
    schema_order?: string[];
    is_latest: boolean;
    source_json?: Record<string, unknown>;
  }

  export interface CreatePipelineInput {
    name: string;
    source_id: string;
    version: string;
  }

  export interface CreateSourceInput {
    name: string;
    description?: string;
  }

  export interface SourceContextType {
    sources: Source[];
    loading: boolean;
    error: string | null;
    refreshSources: () => Promise<void>;
    createSource: (name: string, description?: string) => Promise<Source>;
    deleteSource: (id: string) => Promise<void>;
  }