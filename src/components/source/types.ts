export interface Source {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
  }
  
  export interface CreateSourceInput {
    name: string;
    description?: string;
  }